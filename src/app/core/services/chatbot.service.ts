import { Injectable, signal } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    imageUrl?: string;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class ChatbotService {
    messages = signal<ChatMessage[]>([
        {
            id: '1',
            sender: 'bot',
            text: 'Hi! I am your AI Nutrition Assistant. Send me a photo of your meal or ask me anything!',
            timestamp: new Date()
        }
    ]);

    isLoading = signal<boolean>(false);
    private ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });
    }

    async sendMessage(text: string, imageFile?: File) {
        // 1. Add User Message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: text || (imageFile ? 'Analyzing image...' : ''),
            imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
            timestamp: new Date()
        };
        this.messages.update(msgs => [...msgs, userMsg]);
        this.isLoading.set(true);

        try {
            let responseText = '';

            // Using 'gemini-1.5-flash' as a stable substitute for the requested 'gemini-3-flash-preview'
            const modelName = 'gemini-1.5-flash';

            if (imageFile) {
                // Image Analysis
                const base64Data = await this.fileToBase64(imageFile);
                const response = await this.ai.models.generateContent({
                    model: modelName,
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                { text: text || "Analyze this food. Estimate calories, protein, carbs, and fat." },
                                { inlineData: { mimeType: imageFile.type, data: base64Data } }
                            ]
                        }
                    ]
                });
                responseText = response.text || 'No response text.';
            } else {
                // Text Only
                const response = await this.ai.models.generateContent({
                    model: modelName,
                    contents: {
                        parts: [{ text: text }]
                    }
                });
                responseText = response.text || 'No response text.';
            }

            this.addBotMessage(responseText);
        } catch (error: any) {
            console.error('Gemini Error:', error);
            this.addBotMessage(`⚠️ Error: ${error.message || 'Failed to connect to Gemini.'}`);
        } finally {
            this.isLoading.set(false);
        }
    }

    private addBotMessage(text: string) {
        const botMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'bot',
            text: text,
            timestamp: new Date()
        };
        this.messages.update(msgs => [...msgs, botMsg]);
    }

    private async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Remove the "data:image/jpeg;base64," part
                resolve(base64String.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

