import React from "react"
import { useSnackBar } from "../store/useStore"
const showSnackBar = (text) => {
    const {setSnackBar} = useSnackBar.getState()
    setSnackBar({ visible: true, text: text })
    setTimeout(() => {
        setSnackBar({ visible: false, text: "" })
    }, 1500)
}

export default showSnackBar;