import * as Keychain from "react-native-keychain"
import { useToken, useUrl } from '../store/useStore';

// export const refreshAccessToken = async () => {
//     const { url } = useUrl.getState()
//     const { accessToken, setAccessToken } = useToken.getState()
//     const refreshToken = await Keychain.getGenericPassword({ service: "refreshToken" });
//     const token = await fetch(`${url}/api/user/refresh-access-token`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: "Bearer " + accessToken
//         },
//         body: JSON.stringify({
//             refreshToken: refreshToken.password,
//         })
//     })

//     const res = await token.json()
//     if (res.accessToken) {
//         await setAccessToken(res.accessToken)
//         await Keychain.setGenericPassword("accessToken", res.accessToken, { service: "accessToken" })
//         return (res.accessToken)
//     } else {
//         if (res.message === "log in") {
//             console.log("logged out")
//             await setAccessToken(null)
//             await Keychain.resetGenericPassword({ service: "accessToken" })
//         }
//         return null
//     }
// };