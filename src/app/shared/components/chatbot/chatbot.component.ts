import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { Role } from '../../../core/models/role.enum';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
    selector: 'app-chatbot',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        TooltipModule,
        ProgressSpinnerModule,
        FileUploadModule
    ],
    templateUrl: './chatbot.component.html',
    styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent {
    chatbotService = inject(ChatbotService);
    private authService = inject(AuthService);

    get isPatient(): boolean {
        return this.authService.getUserRole() === Role.Patient;
    }


    isOpen = false;
    userInput = '';
    selectedFile: File | null = null;
    selectedFileUrl: string | null = null;

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            setTimeout(() => this.scrollToBottom(), 100);
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.selectedFileUrl = URL.createObjectURL(file);
        }
    }

    clearFile() {
        this.selectedFile = null;
        this.selectedFileUrl = null;
    }

    sendMessage() {
        if (!this.userInput.trim() && !this.selectedFile) return;

        this.chatbotService.sendMessage(this.userInput, this.selectedFile || undefined);

        // Reset inputs
        this.userInput = '';
        this.clearFile();

        setTimeout(() => this.scrollToBottom(), 100);
    }

    scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }
}
