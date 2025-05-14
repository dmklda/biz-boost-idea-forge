import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SubmitSuccessCase = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    description: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create email content
      const emailContent = `
        New Success Case Submission:
        
        Name: ${formData.name}
        Email: ${formData.email}
        Company: ${formData.companyName}
        
        Story:
        ${formData.description}
      `;
      
      // In a real implementation, you would use a server-side email service
      // Here we'll simulate sending an email using a fake API call
      
      // This is where you would integrate with your email service
      // For now, we'll simulate a successful email send
      
      const emailTo = "contact@startupideia.com";
      console.log(`Email would be sent to: ${emailTo}`);
      console.log(`Email content: ${emailContent}`);
      
      // Wait for a moment to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setIsSubmitting(false);
      setOpen(false);
      toast.success(t("successCases.submitSuccess.title") + ". " + t("successCases.submitSuccess.description"));
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        companyName: "",
        description: ""
      });
    } catch (error) {
      console.error("Error sending email:", error);
      setIsSubmitting(false);
      toast.error("Error: " + "There was a problem submitting your story. Please try again.");
    }
  };

  return (
    <>
      <Button 
        className="flex items-center gap-2" 
        onClick={() => setOpen(true)}
      >
        <Send size={18} />
        {t("successCases.submitButton")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("successCases.submitForm.title")}</DialogTitle>
            <DialogDescription>
              {t("successCases.submitForm.description")}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid w-full items-center gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t("successCases.submitForm.nameLabel")}
              </label>
              <Input 
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t("successCases.submitForm.namePlaceholder")}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t("successCases.submitForm.emailLabel")}
              </label>
              <Input 
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={t("successCases.submitForm.emailPlaceholder")}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="companyName" className="text-sm font-medium">
                {t("successCases.submitForm.companyNameLabel")}
              </label>
              <Input 
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder={t("successCases.submitForm.companyNamePlaceholder")}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                {t("successCases.submitForm.descriptionLabel")}
              </label>
              <Textarea 
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder={t("successCases.submitForm.descriptionPlaceholder")}
                className="min-h-[120px]"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? t("successCases.submitForm.submitting") : t("successCases.submitForm.submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubmitSuccessCase;
