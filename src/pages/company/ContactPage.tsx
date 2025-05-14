
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Phone, Book, Info, Building } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ContactPage = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form schema
  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("contact.form.validation.name"),
    }),
    email: z.string().email({
      message: t("contact.form.validation.email"),
    }),
    subject: z.string().min(1, {
      message: t("contact.form.validation.subject"),
    }),
    message: z.string().min(10, {
      message: t("contact.form.validation.message"),
    }),
  });

  // Form hook
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(values);
    
    // Use toast.success with properly typed parameters
    toast.success({
      title: t("contact.form.success.title"),
      description: t("contact.form.success.message"),
    });
    
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Background element */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      
      <Header />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 mb-16">
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex h-6 items-center rounded-full bg-brand-purple/20 px-3 text-sm text-brand-purple">
              {t("contact.tagline")}
            </div>
          </div>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t("contact.title")}</h1>
            <p className="text-lg text-muted-foreground">{t("contact.subtitle")}</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 mb-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-purple/20 mb-4">
                <Phone className="h-6 w-6 text-brand-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t("contact.cards.support.title")}</h3>
              <p className="text-muted-foreground mb-4">{t("contact.cards.support.description")}</p>
              <p className="font-medium">+1 (555) 123-4567</p>
              <p className="text-muted-foreground">support@startupideia.com</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-purple/20 mb-4">
                <Book className="h-6 w-6 text-brand-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t("contact.cards.sales.title")}</h3>
              <p className="text-muted-foreground mb-4">{t("contact.cards.sales.description")}</p>
              <p className="font-medium">+1 (555) 987-6543</p>
              <p className="text-muted-foreground">sales@startupideia.com</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-purple/20 mb-4">
                <Building className="h-6 w-6 text-brand-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t("contact.cards.office.title")}</h3>
              <p className="text-muted-foreground mb-4">{t("contact.cards.office.description")}</p>
              <p className="font-medium">123 Innovation Ave</p>
              <p className="text-muted-foreground">San Francisco, CA 94103, USA</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card/30 backdrop-blur-sm py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                <div className="p-6 md:p-8">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 mb-4">
                    <Info className="h-5 w-5 text-brand-purple" />
                  </div>
                  <h2 className="text-2xl font-bold mb-6">{t("contact.form.title")}</h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("contact.form.name")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("contact.form.namePlaceholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("contact.form.email")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("contact.form.emailPlaceholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.form.subject")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("contact.form.subjectPlaceholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">{t("contact.form.subjectOptions.general")}</SelectItem>
                                <SelectItem value="support">{t("contact.form.subjectOptions.support")}</SelectItem>
                                <SelectItem value="sales">{t("contact.form.subjectOptions.sales")}</SelectItem>
                                <SelectItem value="partnership">{t("contact.form.subjectOptions.partnership")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.form.message")}</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={t("contact.form.messagePlaceholder")}
                                className="min-h-32" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="btn-premium w-full" disabled={isSubmitting}>
                        {isSubmitting ? t("contact.form.sending") : t("contact.form.send")}
                      </Button>
                    </form>
                  </Form>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
