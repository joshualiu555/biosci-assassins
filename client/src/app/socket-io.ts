import { io } from "socket.io-client";

const socket = io("https://biosci-assassins-f380214977c5.herokuapp.com/", {
  withCredentials: true
});

export default socket;
