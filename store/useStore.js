import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';

const keychainStorage = {
	getItem: async (name) => {
		if (name === "accessToken") {
			const credentials = await Keychain.getGenericPassword({ service: "accessToken" });
			return credentials ? credentials.password : null;
		} else if (name === "refreshtoken") {
			const credentials = await Keychain.getGenericPassword({ service: "refreshtoken" });
			return credentials ? credentials.password : null;
		}
		return null;
	},
	setItem: async (name, value) => {
		if (name === "accessToken") {
			await Keychain.setGenericPassword("accessToken", value, { service: "accessToken" });
		} else if (name === "refreshtoken") {
			await Keychain.setGenericPassword("refreshtoken", value, { service: "refreshtoken" });
		}
	},
	removeItem: async (name) => {
		// if (name === "accessToken") {
		// 	await Keychain.resetGenericPassword();
		// } else if (name === "refreshtoken") {
		// 	await Keychain.resetGenericPassword();
		// }
		await Keychain.resetGenericPassword();
	},
};

export const useDomain = create((set) => (
	{
		domains: [],
		currDomainId: "ccccccc",
		fetchedSectorIds: [],
		setDomains: (updater) =>
			set((state) => ({
				domains: typeof updater === 'function' ? updater(state.domains) : updater
			})),
		setCurrDomainId: (state) => set({ currDomainId: state }),
		setFetchedSectorIds: (updater) =>
			set((state) => ({
				fetchedSectorIds: typeof updater === 'function' ? updater(state.fetchedSectorIds) : updater
			}))
	}
))

export const useChatBoxSectorId = create((set) => ({
	chatBoxSectorId: "",
	setChatBoxSectorId: (state) => set({ chatBoxSectorId: state })
}))

export const useDomainImg = create((set) => ({
	imageUri: {},
	setImageUri: (state) => set({ imageUri: state })
}))

export const useToken = create(
	persist(
		(set) => ({
			accessToken: "",
			setAccessToken: (token) => set({ accessToken: token }),
		}),
		{
			name: "accessToken",
			storage: createJSONStorage(() => keychainStorage),
			// partialize: (state) => ({ accessToken: state.accessToken }),
		}
	)
);

export const useUser = create(
	persist((set) => ({
		user: {},
		setUser: (updater) => set((state) => ({
			user: typeof updater === 'function' ? updater(state.user) : updater
		}))
	}),
		{
			name: "user",
			storage: createJSONStorage(() => AsyncStorage)
		}
	)
)

// export const useLastMessageTime = create(
// 	persist(
// 		(set) => ({
// 			lastMessageTime: Date.now(),
// 			setLastMessageTime: (state) => set({ lastMessageTime: state }),
// 		}),
// 		{
// 			name: 'lastMessageTime',
// 			storage: createJSONStorage(() => AsyncStorage),
// 		}
// 	)
// );

export const useModal = create((set) => ({
	modal: false,
	setModal: (state) => set({ modal: state }),
}))

export const useSettings = create((set) => ({

}))

export const useSnackBar = create((set) => ({
	snackBar: { visible: false, text: "" },
	setSnackBar: (state) => set({ snackBar: state })
}))

export const useDelegateContact = create((set) => ({
	contactHash: "",
	contactList: [],
	selected: [],
	// cacheContact: [],
	setContactHash: (state) => set({ contactHash: state }),
	setContactList: (updater) =>
		set((state) => ({
			contactList: typeof updater === 'function' ? updater(state.contactList) : updater,
		})),
	setSelected: (updater) =>
		set((state) => ({
			selected: typeof updater === 'function' ? updater(state.selected) : updater,
		})),
	// setCacheContact: (state) => set({cacheContact: state})
}))

export const usePending = create(
	persist((set, get) => ({
		pending: [],
		setPending: (i) => set((state) => ({
			pending: [...state.pending, i]
		})),
		markSent: (id) => set((state) => ({
			pending: state.pending.filter(i => i.id !== id)
		})),

		pendingVotes: [],
		setPendingVotes: (i) => set((state) => ({
			pendingVotes: Array.isArray(i) ? i : [...state.pendingVotes, i]
		}))
	}),
		{
			name: "pending",
			storage: createJSONStorage(() => AsyncStorage)
		}
	)
);



