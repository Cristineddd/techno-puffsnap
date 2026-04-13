import React, { useEffect, useState, useCallback } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
  onSnapshot,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Camera, Ticket, Users, Zap, Star, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { db } from '../firebase';

type TicketStatus = 'waiting' | 'served';

interface Ticket {
  id: string;
  queueNumber: number;
  status: TicketStatus;
  createdAt?: any;
}

interface QueueState {
  lastNumber: number;
  currentNumber: number;
}

const PhotoboothQueue: React.FC = () => {
  const navigate = useNavigate();
  const [myTicket, setMyTicket] = useState<Ticket | null>(null);
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queueDocRef = doc(db, 'queue', 'main');
    const unsubscribe = onSnapshot(
      queueDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as QueueState;
          setQueueState({
            lastNumber: data.lastNumber ?? 0,
            currentNumber: data.currentNumber ?? 0,
          });
        } else {
          setQueueState({ lastNumber: 0, currentNumber: 0 });
        }
      },
      (err) => {
        console.error('Error listening to queue/main:', err);
        setError('Failed to connect to queue. Please try again.');
      }
    );
    return () => unsubscribe();
  }, []);

  const handleJoinQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queueDocRef = doc(db, 'queue', 'main');
      const ticketsColRef = collection(db, 'tickets');

      await runTransaction(db, async (transaction) => {
        const queueSnap = await transaction.get(queueDocRef);
        if (!queueSnap.exists()) {
          throw new Error('Queue is not initialized. Please contact the staff.');
        }
        const queueData = queueSnap.data() as QueueState;
        const newNumber = (queueData.lastNumber ?? 0) + 1;

        transaction.update(queueDocRef, { lastNumber: newNumber });

        const newTicketRef = await addDoc(ticketsColRef, {
          queueNumber: newNumber,
          status: 'waiting',
          createdAt: serverTimestamp(),
        });

        setMyTicket({ id: newTicketRef.id, queueNumber: newNumber, status: 'waiting' });
      });
    } catch (err: any) {
      console.error('Error joining queue:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStartBooth = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const nowServing = queueState?.currentNumber ?? 0;
  const myNumber = myTicket?.queueNumber ?? null;
  const isMyTurn = myNumber !== null && myNumber === nowServing;
  const ahead = myNumber !== null ? Math.max(0, myNumber - nowServing - 1) : 0;

  // ── JOIN SCREEN ────────────────────────────────────────────────────────────
  if (!myTicket) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 halftone overflow-hidden">

        {/* Floating decorations */}
        <div className="floating-particle left-[8%] top-[15%]" style={{ animationDelay: '0s' }}>
          <Star className="h-8 w-8 text-accent fill-accent" />
        </div>
        <div className="floating-particle right-[10%] top-[20%]" style={{ animationDelay: '1s' }}>
          <Zap className="h-10 w-10 text-secondary fill-secondary" />
        </div>
        <div className="floating-particle left-[12%] bottom-[22%]" style={{ animationDelay: '2s' }}>
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div className="floating-particle right-[8%] bottom-[28%]" style={{ animationDelay: '1.5s' }}>
          <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
        </div>

        {/* Side speech bubbles */}
        <div className="absolute left-[4%] top-[38%] hidden md:block animate-bounce-in" style={{ animationDelay: '0.4s' }}>
          <div className="comic-card rotate-[-7deg] px-4 py-2">
            <span className="font-display text-xl text-primary">SNAP!</span>
          </div>
        </div>
        <div className="absolute right-[6%] top-[42%] hidden md:block animate-bounce-in" style={{ animationDelay: '0.7s' }}>
          <div className="comic-card rotate-[5deg] px-4 py-2">
            <span className="font-display text-xl text-secondary">SLAY!</span>
          </div>
        </div>

        {/* Main card */}
        <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center gap-6">

          {/* Logo */}
          <div className="animate-float">
            <div className="starburst">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-card border-4 border-foreground">
                <Camera className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>

          {/* Brand */}
          <div>
            <h1
              className="font-display text-7xl md:text-8xl text-primary leading-none tracking-wide"
              style={{
                textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 4px 4px 0 #000',
              }}
            >
              PUFFSNAP
            </h1>
            <div className="speech-bubble mt-3">
              <p className="font-display text-xl text-foreground tracking-wider">
                Snap. Pose. Slay. ✨
              </p>
            </div>
          </div>

          {/* Queue status pills */}
          {queueState && (
            <div className="flex gap-3 flex-wrap justify-center">
              <div className="comic-card bg-green-100 px-5 py-3 flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-green-600" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Now Serving</p>
                  <p className="font-display text-3xl text-green-600 leading-none">{queueState.currentNumber}</p>
                </div>
              </div>
              <div className="comic-card bg-blue-100 px-5 py-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">In Queue</p>
                  <p className="font-display text-3xl text-blue-600 leading-none">
                    {Math.max(0, queueState.lastNumber - queueState.currentNumber)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CTA button */}
          <button
            onClick={handleJoinQueue}
            disabled={loading}
            className="btn-primary-pop group flex items-center gap-3 text-xl w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse font-display tracking-widest">GETTING TICKET...</span>
            ) : (
              <>
                <Ticket className="h-6 w-6 transition-transform group-hover:scale-110" />
                <span className="font-display tracking-widest">JOIN THE QUEUE!</span>
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="comic-card bg-red-100 border-red-400 px-4 py-3 w-full text-center">
              <p className="font-bold text-red-600 text-sm">⚠️ {error}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground font-bold tracking-widest">#PuffSnapIt 📸</p>
        </div>
      </div>
    );
  }

  // ── TICKET / WAITING SCREEN ────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 halftone overflow-hidden">

      {/* Floating decorations */}
      <div className="floating-particle left-[8%] top-[12%]" style={{ animationDelay: '0s' }}>
        <Star className="h-7 w-7 text-accent fill-accent" />
      </div>
      <div className="floating-particle right-[10%] top-[18%]" style={{ animationDelay: '1.2s' }}>
        <Sparkles className="h-8 w-8 text-primary" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-5">

        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-5xl text-primary leading-none" style={{
            textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000',
          }}>
            YOUR TICKET
          </h1>
          <p className="text-sm font-bold text-muted-foreground mt-1 tracking-widest">Keep this screen open!</p>
        </div>

        {/* Big ticket card */}
        <div className={`comic-card-lg w-full p-0 overflow-hidden transition-all duration-500 ${isMyTurn ? 'ring-4 ring-green-400 ring-offset-4' : ''}`}>

          {/* Ticket header strip */}
          <div className={`px-6 py-3 flex items-center justify-between ${isMyTurn ? 'bg-green-400' : 'bg-primary'}`}>
            <span className="font-display text-sm text-white tracking-widest">PUFFSNAP</span>
            <Ticket className="h-5 w-5 text-white" />
            <span className="font-display text-sm text-white tracking-widest">PHOTOBOOTH</span>
          </div>

          {/* Dashed divider */}
          <div className="border-b-4 border-dashed border-foreground mx-4" />

          {/* Number */}
          <div className="px-6 py-6 text-center">
            <p className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-1">Queue Number</p>
            <p className={`font-display leading-none ${isMyTurn ? 'text-green-500' : 'text-primary'}`}
              style={{ fontSize: '6rem', textShadow: '3px 3px 0 #000' }}>
              {myNumber}
            </p>
          </div>

          {/* Dashed divider */}
          <div className="border-b-4 border-dashed border-foreground mx-4" />

          {/* Now serving row */}
          <div className="px-6 py-4 flex items-center justify-between bg-muted/30">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Now Serving</p>
              <p className="font-display text-4xl text-green-500 leading-none">{nowServing}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ahead of You</p>
              <p className={`font-display text-4xl leading-none ${ahead === 0 && !isMyTurn ? 'text-yellow-500' : ahead > 0 ? 'text-foreground' : 'text-green-500'}`}>
                {isMyTurn ? '0' : ahead}
              </p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
              <p className={`font-display text-sm leading-tight mt-1 ${isMyTurn ? 'text-green-500' : 'text-yellow-500'}`}>
                {isMyTurn ? '🎉 GO!' : '⏳ Wait'}
              </p>
            </div>
          </div>
        </div>

        {/* Action area */}
        {isMyTurn ? (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="comic-card bg-green-100 border-green-400 w-full px-4 py-3 text-center animate-bounce">
              <p className="font-display text-2xl text-green-600">🎉 IT'S YOUR TURN! 🎉</p>
              <p className="text-sm font-bold text-green-700 mt-1">Head to the photobooth now!</p>
            </div>
            <button
              onClick={handleStartBooth}
              className="btn-primary-pop group flex items-center gap-3 text-xl w-full justify-center"
              style={{ background: '#4ade80', color: '#000' }}
            >
              <Camera className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span className="font-display tracking-widest">START BOOTH</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="comic-card bg-yellow-100 border-yellow-400 w-full px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <p className="font-display text-lg text-yellow-700">HANG TIGHT!</p>
              </div>
              <p className="text-sm font-bold text-yellow-700">
                {ahead === 0
                  ? "You're next up! Get ready 🙌"
                  : `${ahead} ${ahead === 1 ? 'person' : 'people'} ahead of you.`}
              </p>
              <p className="text-xs text-yellow-600 mt-1">This page updates automatically.</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="comic-card bg-red-100 border-red-400 px-4 py-3 w-full text-center">
            <p className="font-bold text-red-600 text-sm">⚠️ {error}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground font-bold tracking-widest">#PuffSnapIt 📸</p>
      </div>
    </div>
  );
};

export default PhotoboothQueue;
