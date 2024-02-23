"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  aspectRatioOptions,
  creditFee,
  defaultValues,
  transformationTypes,
} from "../../../constants";
import { CustomField } from "./CustomField";
import { useState, useTransition } from "react";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import { updateCredits } from "@/lib/actions/user.action";

export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  prompt: z.string().optional(),
  color: z.string().optional(),
  publicId: z.string(),
});

const TransformationForm = ({
  action,
  data = null,
  userId,
  type,
  creditBalance,
}: TransformationFormProps) => {
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTranforming, setIsTranforming] = useState(false)
    const [transformationConfig, setTransformationConfig] = useState(null)
    const [isPending, startTransition] = useTransition()

  const [newTransformation, setnewTransformation] =
    useState<Transformations | null>(null);
  const initialValues =
    data && action === "Update"
      ? {
          title: data?.title,
          aspectRatio: data?.description,
          prompt: data?.prompt,
          color: data?.color,
          publicId: data?.publicId,
        }
      : defaultValues;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  const onSelectFieldHandler = (
    value: string,
    onChangeField: (value: string) => void
  ) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey]
    setImage((prevState: any)=>(
        {
            ...prevState,
            aspectRatio: imageSize.aspectRatio,
            width: imageSize.width,
            height: imageSize.height
        }
    ))
    setnewTransformation(transformationType.config);
    return onChangeField(value);
  };

  const onInputChangehandler = (
    fieldName: string,
    value: string,
    type: string,
    onChangeField: (value: string) => void
  ) => {
    debounce(()=>{
        setnewTransformation((prevState: any)=>({
            ...prevState?.[type],
            [fieldName === 'prompt'?'prompt': 'to']: value
        }))    },1000)
  };
  
// TODO: Return to updateCredits
const onTransformHandler =  async() =>{
    setIsTranforming(true)
    setTransformationConfig(deepMergeObjects(newTransformation,transformationConfig));
    setnewTransformation(null);

    startTransition(async()=>{
        // await updateCredits(userId, creditFee)
    })
}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CustomField
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />

        {type === "fill" && (
          <CustomField
            control={form.control}
            formLabel="Aspect Ratio"
            name="aspectRatio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  onSelectFieldHandler(value, field.onChange);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => (
                    <SelectItem key={key} value={key} className="select-item">
                      {aspectRatioOptions[key as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
        {(type === "remove" || type === "recolor") && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={
                type === "remove" ? "Object to remove" : "object to recolor"
              }
              className="w-full"
              render={({ field }) => (
                <Input
                  value={field.value}
                  className="input-field"
                  onChange={(e) => {
                    onInputChangehandler(
                      "prompt",
                      e.target.value,
                      type,
                      field.onChange
                    );
                  }}
                />
              )}
            />
          </div>
        )}
        {type === "recolor" && (
          <CustomField
            control={form.control}
            name="color"
            formLabel="Replacement Color"
            className="w-full"
            render={({ field }) => <Input 
            value={field.value}
            className="input-field"
            onChange={(e) => {
              onInputChangehandler(
                "color",
                e.target.value,
                'recolor',
                field.onChange
              );
            }}
            />}
          />
        )}
        <div className="flex flex-col gap-4">
        <Button type="button" className="submit-button capitalize" disabled={isTranforming || newTransformation===null} onClick={
            onTransformHandler
        }>{
            isTranforming? "transforming...": 'Apply Transformation'
        }</Button>
        <Button type="submit" className="submit-button capitalize" disabled={isSubmitting} >{isSubmitting ? 'submitting...' : "save Image"}</Button>
        </div>
        
      </form>
    </Form>
  );
};

export default TransformationForm;
