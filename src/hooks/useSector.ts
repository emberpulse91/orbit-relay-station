import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DRIFT_INTERVAL_MS, RESOLVE_MS, TICK_MS } from '../constants/config';
import { driftStep } from '../game/drift';
import {
  canPlaceAt,
  isCollapsed,
  placeRelay,
  recycleRelay,
  refundFor,
} from '../game/energy';
import { generateSector } from '../game/sectorGenerator';
import { MODULE_BY_ID, cheapestUnlockedCost } from '../game/modules';
import { route } from '../game/routing';
import { roundScore, starsFor } from '../game/scoring';
import type {
  Asteroid,
  ModuleId,
  Point,
  Relay,
  RoundStats,
  Sector,
} from '../game/types';

export type Phase = 'idle' | 'playing' | 'resolving' | 'paused';

export interface UseSectorArgs {
  level: number;
  attempt: number;
  sectorsCleared: number;
  defaultModule: ModuleId;
  onGameOver: (stats: RoundStats) => void;
}

export function useSector({
  level,
  attempt,
  sectorsCleared,
  defaultModule,
  onGameOver,
}: UseSectorArgs) {
  const sector: Sector = useMemo(
    () => generateSector(level, attempt),
    [level, attempt],
  );

  const [relays, setRelays] = useState<Relay[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>(sector.asteroids);
  const [energy, setEnergy] = useState<number>(sector.budget);
  const [phase, setPhase] = useState<Phase>('idle');
  const [msLeft, setMsLeft] = useState<number>(sector.flareWindowMs);
  const [selectedModule, setSelectedModule] = useState<ModuleId>(defaultModule);
  const [selectedRelayId, setSelectedRelayId] = useState<string | null>(null);
  const [rejectedCell, setRejectedCell] = useState<string | null>(null);
  const [driftWarning, setDriftWarning] = useState<string[]>([]);
  const [lastPlacedId, setLastPlacedId] = useState<string | null>(null);

  const idCounter = useRef(0);
  const finishedRef = useRef(false);
  const phaseRef = useRef<Phase>('idle');
  const msLeftRef = useRef(sector.flareWindowMs);
  const driftAccRef = useRef(0);
  const stateRef = useRef({ relays, asteroids, energy });
  const onGameOverRef = useRef(onGameOver);
  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rejectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Every deferred callback reads the round through these refs, never through a
  // stale closure over useState values.
  onGameOverRef.current = onGameOver;
  phaseRef.current = phase;
  msLeftRef.current = msLeft;
  stateRef.current = { relays, asteroids, energy };

  const cheapest = useMemo(
    () => cheapestUnlockedCost(sectorsCleared),
    [sectorsCleared],
  );

  // A fresh sector resets every piece of round state.
  useEffect(() => {
    idCounter.current = 0;
    finishedRef.current = false;
    driftAccRef.current = 0;
    msLeftRef.current = sector.flareWindowMs;
    setRelays([]);
    setAsteroids(sector.asteroids);
    setEnergy(sector.budget);
    setPhase('idle');
    setMsLeft(sector.flareWindowMs);
    setSelectedRelayId(null);
    setRejectedCell(null);
    setDriftWarning([]);
    setLastPlacedId(null);
  }, [sector]);

  useEffect(() => {
    setSelectedModule(defaultModule);
  }, [defaultModule, sector]);

  const routing = useMemo(
    () => route(sector.reactor, sector.domes, relays, asteroids, sector.maxHops),
    [sector, relays, asteroids],
  );
  const routingRef = useRef(routing);
  routingRef.current = routing;

  const finish = useCallback(
    (
      outcome: RoundStats['outcome'],
      reason: RoundStats['reason'],
      snapshot: { energy: number; relays: Relay[]; domesLit: number },
    ) => {
      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      const secondsLeft = Math.max(0, Math.round(msLeftRef.current / 1000));
      const stats: RoundStats = {
        outcome,
        reason,
        level: sector.level,
        energyLeft: Math.max(0, snapshot.energy),
        budget: sector.budget,
        relaysUsed: snapshot.relays.length,
        domesLit: snapshot.domesLit,
        domesTotal: sector.domes.length,
        secondsLeft,
        score:
          outcome === 'win'
            ? roundScore(snapshot.energy, secondsLeft, snapshot.domesLit)
            : 0,
        stars: outcome === 'win' ? starsFor(snapshot.energy, sector.budget) : 0,
      };
      onGameOverRef.current(stats);
    },
    [sector],
  );

  const evaluate = useCallback(
    (nextRelays: Relay[], nextEnergy: number, nextAsteroids: Asteroid[]) => {
      const r = route(
        sector.reactor,
        sector.domes,
        nextRelays,
        nextAsteroids,
        sector.maxHops,
      );
      const lit = r.poweredDomeIndices.length;
      if (r.allDomesPowered) {
        phaseRef.current = 'resolving';
        setPhase('resolving');
        if (resolveTimer.current) {
          clearTimeout(resolveTimer.current);
        }
        resolveTimer.current = setTimeout(() => {
          finish('win', 'stabilized', {
            energy: nextEnergy,
            relays: nextRelays,
            domesLit: lit,
          });
        }, RESOLVE_MS);
        return;
      }
      if (isCollapsed(nextEnergy, cheapest, r.allDomesPowered)) {
        finish('lose', 'collapse', {
          energy: nextEnergy,
          relays: nextRelays,
          domesLit: lit,
        });
      }
    },
    [sector, cheapest, finish],
  );

  // The only loop of the round. It advances the flare countdown and the drift
  // tick, and the interval is cleared when the sector or the screen goes away.
  useEffect(() => {
    const handle = setInterval(() => {
      if (finishedRef.current || phaseRef.current !== 'playing') {
        return;
      }
      const next = msLeftRef.current - TICK_MS;
      msLeftRef.current = next;
      setMsLeft(next > 0 ? next : 0);

      if (next <= 0) {
        const snap = stateRef.current;
        finish('lose', 'flare', {
          energy: snap.energy,
          relays: snap.relays,
          domesLit: routingRef.current.poweredDomeIndices.length,
        });
        return;
      }

      if (!sector.asteroids.some(a => a.drifting)) {
        return;
      }

      driftAccRef.current += TICK_MS;
      const untilDrift = DRIFT_INTERVAL_MS - driftAccRef.current;
      if (untilDrift <= 3000 && untilDrift > 0) {
        const marked = stateRef.current.asteroids
          .filter(a => a.drifting)
          .map(a => a.id);
        setDriftWarning(prev =>
          prev.length === marked.length ? prev : marked,
        );
      }
      if (driftAccRef.current >= DRIFT_INTERVAL_MS) {
        driftAccRef.current = 0;
        setDriftWarning([]);
        const snap = stateRef.current;
        const stepped = driftStep(
          snap.asteroids,
          sector.reactor,
          sector.domes,
          snap.relays,
          sector.cols,
          sector.rows,
        );
        if (stepped.moved.length > 0) {
          setAsteroids(stepped.asteroids);
          evaluate(snap.relays, snap.energy, stepped.asteroids);
        }
      }
    }, TICK_MS);

    return () => {
      clearInterval(handle);
      if (resolveTimer.current) {
        clearTimeout(resolveTimer.current);
        resolveTimer.current = null;
      }
    };
  }, [sector, evaluate, finish]);

  useEffect(
    () => () => {
      if (rejectTimer.current) {
        clearTimeout(rejectTimer.current);
        rejectTimer.current = null;
      }
    },
    [],
  );

  const flashReject = useCallback((cellKey: string) => {
    setRejectedCell(cellKey);
    if (rejectTimer.current) {
      clearTimeout(rejectTimer.current);
    }
    rejectTimer.current = setTimeout(() => setRejectedCell(null), 220);
  }, []);

  const tapCell = useCallback(
    (cell: Point) => {
      if (finishedRef.current) {
        return;
      }
      if (phaseRef.current === 'resolving' || phaseRef.current === 'paused') {
        return;
      }
      const snap = stateRef.current;

      const existing = snap.relays.find(
        r => r.col === cell.col && r.row === cell.row,
      );
      if (existing) {
        setSelectedRelayId(prev => (prev === existing.id ? null : existing.id));
        return;
      }

      const blockedBy = canPlaceAt(
        cell,
        sector.reactor,
        sector.domes,
        snap.asteroids,
        snap.relays,
        sector.cols,
        sector.rows,
      );
      if (blockedBy) {
        flashReject(cell.col + ':' + cell.row);
        return;
      }

      idCounter.current += 1;
      const result = placeRelay(
        cell,
        selectedModule,
        snap.energy,
        snap.relays,
        sector.reactor,
        sector.domes,
        snap.asteroids,
        sector.cols,
        sector.rows,
        idCounter.current,
      );
      if (!result.ok) {
        flashReject(cell.col + ':' + cell.row);
        return;
      }

      setRelays(result.relays);
      setEnergy(result.energy);
      setSelectedRelayId(null);
      setLastPlacedId(result.placedId || null);
      if (phaseRef.current === 'idle') {
        phaseRef.current = 'playing';
        setPhase('playing');
      }
      evaluate(result.relays, result.energy, snap.asteroids);
    },
    [sector, selectedModule, flashReject, evaluate],
  );

  const recycle = useCallback(() => {
    if (!selectedRelayId || finishedRef.current) {
      return;
    }
    const snap = stateRef.current;
    const res = recycleRelay(selectedRelayId, snap.relays, snap.energy);
    setRelays(res.relays);
    setEnergy(res.energy);
    setSelectedRelayId(null);
    evaluate(res.relays, res.energy, snap.asteroids);
  }, [selectedRelayId, evaluate]);

  const restart = useCallback(() => {
    idCounter.current = 0;
    finishedRef.current = false;
    driftAccRef.current = 0;
    msLeftRef.current = sector.flareWindowMs;
    phaseRef.current = 'idle';
    if (resolveTimer.current) {
      clearTimeout(resolveTimer.current);
      resolveTimer.current = null;
    }
    setRelays([]);
    setAsteroids(sector.asteroids);
    setEnergy(sector.budget);
    setMsLeft(sector.flareWindowMs);
    setPhase('idle');
    setSelectedRelayId(null);
    setLastPlacedId(null);
    setDriftWarning([]);
  }, [sector]);

  const pause = useCallback(() => {
    if (phaseRef.current === 'playing' || phaseRef.current === 'idle') {
      phaseRef.current = 'paused';
      setPhase('paused');
    }
  }, []);

  const resume = useCallback(() => {
    const next: Phase = stateRef.current.relays.length > 0 ? 'playing' : 'idle';
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const selectedRelay = useMemo(
    () => relays.find(r => r.id === selectedRelayId) || null,
    [relays, selectedRelayId],
  );

  const refund = selectedRelay ? refundFor(selectedRelay.moduleId) : 0;
  const selectedCost = MODULE_BY_ID[selectedModule].cost;

  return {
    sector,
    relays,
    asteroids,
    energy,
    phase,
    msLeft,
    routing,
    selectedModule,
    setSelectedModule,
    selectedRelayId,
    selectedRelay,
    rejectedCell,
    driftWarning,
    lastPlacedId,
    refund,
    selectedCost,
    cheapest,
    tapCell,
    recycle,
    restart,
    pause,
    resume,
  };
}

export default useSector;
