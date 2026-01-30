
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { MenubarModule } from 'primeng/menubar';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        DropdownModule,
        InputNumberModule,
        PasswordModule,
        TableModule,
        DialogModule,
        AvatarModule,
        CalendarModule,
        InputTextareaModule,
        TagModule,
        ChipModule,
        MenubarModule,
        DividerModule,
        MenuModule
    ],
    exports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        DropdownModule,
        InputNumberModule,
        PasswordModule,
        TableModule,
        DialogModule,
        AvatarModule,
        CalendarModule,
        InputTextareaModule,
        TagModule,
        ChipModule,
        MenubarModule,
        DividerModule,
        MenuModule
    ]
})
export class SharedUiModule { }
