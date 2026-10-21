import { io } from "socket.io-client";
import { SOCKET_URL } from "./api";

export function watchShop(slug, onStock) {
  const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
  const join = () => socket.emit("join", slug);
  socket.on("connect", join);
  socket.on("stock", (payload) => onStock(payload?.products || []));
  join();
  return () => socket.close();
}
