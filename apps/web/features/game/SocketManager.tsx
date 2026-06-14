"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import { useGameStore } from "./store/game-store";
import { GameEvent, GameState } from "@richup/shared-types";
import { useRouter } from "next/navigation";

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '/game');
  return "http://localhost:3001/game";
};
const SOCKET_URL = getSocketUrl();

let socketInstance: Socket | null = null;

export function SocketManager() {
  const { getToken, isSignedIn } = useAuth();
  const setConnection = useGameStore((state) => state.setConnection);
  const setGameState = useGameStore((state) => state.setGameState);
  const applyEvent = useGameStore((state) => state.applyEvent);
  const setIdleTimeout = useGameStore((state) => state.setIdleTimeout);
  const router = useRouter();
  
  useEffect(() => {
    if (!isSignedIn) return;

    const connectSocket = async () => {
      if (socketInstance) return;

      try {
        const token = await getToken();
        if (!token) return;

        socketInstance = io(SOCKET_URL, {
          auth: { token: `Bearer ${token}` },
          transports: ['websocket'],
        });
      
      socketInstance.on("connect", () => {
        console.log("Connected to Game Server:", socketInstance?.id);
        setConnection(true, null, socketInstance);
      });

      socketInstance.on("disconnect", () => {
        console.log("Disconnected from Game Server");
        setConnection(false, null, null);
      });

      socketInstance.on("game_state", (state: GameState) => {
        setGameState(state);
      });

      socketInstance.on("game_events", (events: GameEvent[]) => {
        events.forEach(applyEvent);
      });

      socketInstance.on("idle_warning", (data: { timeoutAt: number }) => {
        setIdleTimeout(data.timeoutAt);
      });

      socketInstance.on("game_aborted", (data: { reason: string }) => {
        setIdleTimeout(null);
        if (data.reason === 'idle_timeout') {
          alert("The game was closed due to inactivity.");
        } else {
          alert("The game was aborted.");
        }
        router.push("/rooms");
      });
      } catch (err) {
        console.error("Failed to connect socket:", err);
      }
    };

    connectSocket();

    return () => {
      // Don't eagerly disconnect on strict mode renders, just let the instance persist
      // Or we can disconnect if the component actually unmounts permanently (e.g. log out)
    };
  }, [isSignedIn, getToken, setConnection, setGameState, applyEvent, setIdleTimeout, router]);

  // Periodically check connection status as a fallback
  useEffect(() => {
    const interval = setInterval(() => {
      if (socketInstance) {
        setConnection(socketInstance.connected, null, socketInstance);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [setConnection]);

  return null; // This is a logic-only component
}
