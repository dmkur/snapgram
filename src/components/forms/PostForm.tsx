import { z } from "zod";
import { Models } from "appwrite";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "@/components/ui/input";

import { PostValidation } from "@/lib/validation";
import { useToast } from "../ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import FileUploader from "../shared/FileUploader";
import { useCreatePost, useDeletePost, useUpdatePost } from "@/lib/react-query/queriesAndMutations";

type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

const PostForm = ({ action , post }: PostFormProps) => {
  const { mutateAsync: createPost, isPending: isLoadingCreate } =
  useCreatePost();

  const { mutateAsync: updatePost, isPending: isLoadingUpdate } =
  useUpdatePost();

  // const { mutateAsync: createPost, isPending: isLoadingCreate } =
  // useDeletePost();

  

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post?.location : "",
      tags: post ? post?.tags?.join(",") : "",
    },
  });

  

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof PostValidation>) {
    if(post && action === "Update"){
      const updatedPost = await updatePost({
        ...values,
        postId:post.$id,
        imageId:post?.imageId,
        imageUrl: post?.imageUrl
      })
        if(!updatedPost) toast({title: "Please try again"})

        return navigate(`/posts/${post.$id}`)
    }

    const newPost = await createPost({
      ...values,
      userId: user.id,
    });

    if (!newPost) {
      toast({
        title: "Please try again",
      });
    }
    navigate("/");
  }


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  {...field}
                />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Tags (separated by ",")
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="Art, Expresion, Learn"
                  {...field}
                />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <div className="flex gap-4 items-center justify-end">
          <Button type="button" className="shad-button_dark_4">
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingUpdate || isLoadingCreate}
          >
            {isLoadingCreate || isLoadingUpdate && "Loading..."}
            {action} Post
            
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
