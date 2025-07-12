import { FileUploadArea } from '@/components/FileUploadArea';
import { ChatInterface } from '@/components/ChatInterface';
import { SessionSelector } from '@/components/SessionSelector';
import { AISettingsProvider } from '@/context/AISettingsContext';
import { StudySessionProvider } from '@/context/StudySessionContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { BookOpen, UploadCloud, MessageSquare } from 'lucide-react';

export default function IndexPage() {
  return (
    <AISettingsProvider>
      <StudySessionProvider>
        <div className="container mx-auto py-6">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-bold text-primary">Study Helper</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Upload your homework and get personalized guidance, not just answers
            </p>
          </header>

          <div className="grid md:grid-cols-[300px_1fr] gap-6">
            <aside className="md:border-r md:pr-6">
              <SessionSelector />
            </aside>

            <main className="flex flex-col space-y-6">
              <Tabs defaultValue="chat" className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="chat" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center">
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Upload
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="chat">
                  <Card className="h-[calc(100vh-300px)]">
                    <ChatInterface />
                  </Card>
                </TabsContent>
                <TabsContent value="upload">
                  <Card className="p-6">
                    <FileUploadArea />
                  </Card>
                </TabsContent>
              </Tabs>

              <section className="bg-primary-foreground p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">How It Works</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-background rounded-md">
                    <div className="font-medium">1. Upload</div>
                    <p className="text-sm text-muted-foreground">
                      Share your homework files, questions, or notes
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-md">
                    <div className="font-medium">2. Ask</div>
                    <p className="text-sm text-muted-foreground">
                      Ask specific questions about your homework
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-md">
                    <div className="font-medium">3. Learn</div>
                    <p className="text-sm text-muted-foreground">
                      Receive guidance that helps you understand, not just answer
                    </p>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </StudySessionProvider>
    </AISettingsProvider>
  );
}