import { country_dial_codes } from "./country-dial-codes";
import { useDelegateContact, useDomain, } from "../store/useStore"

const { setDomains } = useDomain.getState()
const { contactList } = useDelegateContact.getState(state => state.contactList)

function midnightTimestamp() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
}

const cleanPhoneNumber = (input) => {
    const number = input.trim();
    for (let i of country_dial_codes) {
        if (number.startsWith(i)) {
            return number.replace(i, '').replace(/\D/g, '')
        }
    }
    if (number.startsWith("0")) {
        return number.slice(1).replace(/\D/g, '');
    }
    return number.replace(/\D/g, '');
};

const findContactByPhoneNumber = async (number) => {
    const cache = {}
    const key = number.trim();
    if (cache[key]) return cache[key];
    const match = contactList.find(contact =>
        contact.phoneNumbers?.some(i =>
            cleanPhoneNumber(i) == number
        )
    )
    const result = match ? match.displayName : number
    cache[key] = result
    return result
}

export const createChat = async (phoneNumber, data) => {
    const number = await cleanPhoneNumber(phoneNumber)
    const title = await findContactByPhoneNumber(number)
    await setDomains(prev =>
        prev.map(d =>
            d._id === "ccccccc" ? {
                ...d,
                sectors: [...d.sectors, {
                    _id: data.sector_id, domain_id: "ccccccc", title: title, status: "private",
                    data: [
                        { ...data, time: Date.now() },
                        { _id: Date.now().toString(), creator_id: "user", note: new Date(Date.now()).toLocaleDateString(), createdAt: midnightTimestamp() }
                    ], time: Date.now()
                }]
            }
                : d
        ));
}