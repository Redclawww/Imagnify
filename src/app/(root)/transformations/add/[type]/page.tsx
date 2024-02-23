import Header from "@/components/shared/Header";
import React from "react";
import { transformationTypes } from "../../../../../../constants";
import TransformationForm from "@/components/shared/TransformationForm";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";

const AddTransformationTypePage = async ({
  params: { type },
}: SearchParamProps) => {
  const { userId } = auth();
  const transformtion = transformationTypes[type];
  if (!userId) redirect("/sign-in");
  const user = await getUserById(userId);
  return (
    <>
      <Header title={transformtion.title} subtitle={transformtion.subTitle} />
      <section className="mt-10" >
        <TransformationForm
          action="Add"
          userId={user._id}
          type={transformtion.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;
