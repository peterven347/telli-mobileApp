import React from 'react';
import Contacts from 'react-native-contacts';
import CryptoJS from "crypto-js";
import { useDelegateContact } from '../store/useStore';

const refreshContactDomain = async () => {
    console.log("refreshing contact domain")
}

const getContacts = async () => {
    const { setContactList, contactHash, setContactHash } = useDelegateContact.getState()
    let temp_list = []
    await Contacts.getAll().then(contacts => {
        contacts.forEach(i => {
            let temp = {}
            for (let number of i.phoneNumbers) {
                if (temp.recordID == i.recordID) {
                    temp["phoneNumbers"] = [...new Set([...temp["phoneNumbers"], number.number])]
                } else {
                    temp["recordID"] = (`${i.recordID}` + `${number.id}`)
                    temp["displayName"] = i.displayName
                    temp["phoneNumbers"] = [number.number]
                }
            }
            Object.keys(temp).length > 0 && temp_list.push(temp)
        })
        const _hash = CryptoJS.MD5(JSON.stringify(temp_list)).toString()
        if (contactHash !== _hash) {
            refreshContactDomain()
        }
        setContactList(temp_list)
        setContactHash(_hash)
    })
}

export default getContacts;