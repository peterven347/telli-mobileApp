export const url = "http://10.119.44.133:3030" //3030
import { io } from "socket.io-client"
import { useToken } from "../store/useStore"

let socket;
export const initSocket = async (accessToken) => {
    if (!useToken.persist.hasHydrated) {
        await new Promise((resolve) => useToken.persist.onFinishHydration(resolve));
    }
    console.log("token hydration completed")
    const token = accessToken || useToken.getState().accessToken;
    if (token) {
        socket = io(url, {
            auth: { token },
            autoConnect: false
        });
        return socket;
    }
};

// export const initSocket = async (accessToken) => {
//     socket = io(url);
//     return socket;
// };

export const socketEmit = (e, data) => {
    socket.emit(e, data)
}

export const refreshSocketToken = (token) => {
    socket.auth.token = token
    socket.connect()
}

export const disconnectSocket = () => {
    socket.disconnect()
}