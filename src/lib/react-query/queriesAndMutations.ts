import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import {
    UpdatePost,
    createPost, createUserAccount, deletePost, deleteSavedPost,
    getCurrentUser, getInfinitePosts, getPostById, getRecentPosts, likePost,
    savePost,
    searchPost,
    signInAccount, signOutAccount
} from '../appwrite/api'
import { INewPost, INewUser, IUpdatePost } from '@/types'
import { QUERY_KEYS } from './queryKeys'

export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    })
}

export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: { email: string, password: string }) => signInAccount(user)
    })
}

export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutAccount
    })
}

export const useCreatePost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (post: INewPost) => createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}

export const useGetRecentPosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts
    })
}

export const useLikePost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        // оск дані посту кешовані cтавлячи лайк ми змігнюємо к-ть лайків і оновлюємо цю к-ть
        // проте якщо ми зайдемо на цей пост ми не побачимо оновленої кількості лайків оск пост попередньо кешований
        // тому там інформація ще раніша тобто до зміни к-ті лайків
        mutationFn: ({ postId, likesArray }: { postId: string, likesArray: string[] }) => likePost(postId, likesArray),
        onSuccess: (data) => {
            // щоб оновити цю к-ть не тільки на Home а й при переході на сам пост буде використано  queryClient.invalidateQueries
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
            // аналогічно якщо ми перезавантажемо сторінку Home ми також оновимо часті пости
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS,]
            })
            // оновлюємо всі пости в загальному
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS,]
            })
            // аналогічно якщо ми підемо в profile юзера ми теж там повинні побачити актуальні дані лайків
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER,]
            })
        }
    })
}

export const useSavePost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ postId, userId }: { postId: string, userId: string }) => savePost(postId, userId),
        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID,]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS,]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS,]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER,]
            })
        }
    })
}

export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID,]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS,]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS,]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER,]
            })
        }
    })
}

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser
    })
}

export const useGetPostById = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        // turn on new fetch only for another postId 
        enabled: !!postId
    })
}

export const useUpdatePost = () => {
    // however we update it will be mutation
    //  that is why we use useMutation
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (post: IUpdatePost) => UpdatePost(post),
        onSuccess: (data) => {
            // після оновлення посту якщо ми підемо в деталі посту вони  також ма бути оновленими
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
        }
    })
}

export const useDeletePost = () => {

    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ postId, imageId }: { postId: string, imageId: string }) => deletePost(postId, imageId),
        onSuccess: () => {
            // після видалення посту ми оновимо дані Home 
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}

export const useGetPosts = () => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        queryFn: getInfinitePosts as any,
        getNextPageParam: (lastPage: any) => {
            if (lastPage && lastPage.documents.length === 0) return null

            const lastId = lastPage.documents[lastPage.documents.length - 1].$id

            return lastId
        }
    })
}

export const useSearchPosts = (searchTerm: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
        queryFn: () => searchPost(searchTerm),
        enabled: !!searchTerm
    })
}
