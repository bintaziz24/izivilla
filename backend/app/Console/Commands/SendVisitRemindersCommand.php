<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\AppointmentController;

class SendVisitRemindersCommand extends Command
{
    protected $signature = 'izivilla:send-visit-reminders';
    protected $description = 'Vérifier et envoyer les rappels de visites automatiques (24h et 2h avant)';

    public function handle()
    {
        $this->info('Analyse des visites à venir et envoi des rappels...');
        
        $controller = new AppointmentController();
        $response = $controller->sendReminders();
        $data = json_decode($response->getContent(), true);

        $this->info($data['message'] ?? 'Rappels envoyés.');
        $this->line("Rappels 24h envoyés : " . ($data['reminders_24h_sent'] ?? 0));
        $this->line("Rappels 2h envoyés : " . ($data['reminders_2h_sent'] ?? 0));

        return Command::SUCCESS;
    }
}
