import { url } from "./socket"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToken } from "../store/useStore"

const POST_URL = `${url}/post`

const getPosts = async (cursor) => {
    const { accessToken } = useToken.getState()
    const httpCall = await fetch(`${POST_URL}/post?cursor=${cursor}`, {
        headers: {
            // "content-type": "multipart/form-data",
            Authorization: "Bearer " + accessToken
        }
    })
    const res = await httpCall.json()
    return res
};

const createPost = async (text, images) => {
    const formData = new FormData()
    formData.append("text", text)
    images.forEach((i) => {
        if (i.uri) {
            formData.append("files", {
                uri: i.uri,
                type: i.type,
                name: i.fileName
            });
        }
    })
    const { accessToken } = useToken.getState()
    const httpCall = await fetch(POST_URL + "/post", {
        method: "POST",
        headers: {
            // "content-type": "multipart/form-data",
            Authorization: "Bearer " + accessToken
        },
        body: formData
    })
    const res = await httpCall.json()
    return res
};

export const useInfiniteScroll = () => {
    return useInfiniteQuery({
        queryKey: ["post"],
        queryFn: ({ pageParam = undefined }) => getPosts(pageParam),
        getNextPageParam: (lastPage) => lastPage.nextPageCursor || undefined,
        onError: (err) => {
            console.log(err)
        },
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["post"],
        mutationFn: ({ text, images }) => createPost(text, images),
        onSuccess: (data) => {
            queryClient.setQueryData(['post'], (prev) => {
                if (!prev) {
                    return {
                        pages: [{ posts: [data], nextPageCursor: null }],
                        pageParams: [],
                    };
                }
                const firstPage = prev.pages[0];
                const exists = firstPage.posts.some(post => post._id === data._id);

                if (exists) {
                    return prev;
                }
                const updatedFirstPage = {
                    ...firstPage,
                    posts: [data, ...firstPage.posts],
                };

                return {
                    ...prev,
                    pages: [updatedFirstPage, ...prev.pages.slice(1)],
                };
            });


        },
        onError: (err) => {
            console.log(err)
        }
    })
};

