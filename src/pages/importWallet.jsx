import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const phraseSchema = z.object({
  phrase: z.array().nonempty({ message: "This feild is required" }),
});
const ImportWallet = () => {
      const navigate = useNavigate();


  const form = useForm({
    resolver: zodResolver(phraseSchema),
    defaultValues: {
      phrase: "",
    },
  });
  return (
    <>
      <div className=" max-w-md h-screen mx-auto flex flex-col pb-10 pt-6">


        <ArrowLeft 
        onClick={
          ()=>{

            navigate('/get-started')
          }

        }
        className="  mx-4"/>

        <h1 className="text-2xl font-bold mb-8 text-center">
          Import Existing Wallet
        </h1>

        <div className="mx-10 ">
          <Form {...form}>
            <FormField
              control={form.control}
              name="phrase"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <textarea
                    {...field}
                      className="border p-2 shadow-xl rounded-lg  w-full  "
                      rows={6}
                      placeholder=" Enter seed phrase... "
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>

          <div className="flex items-end relative top-60 ">
            <Button className={" w-full flex"}>import</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImportWallet;
