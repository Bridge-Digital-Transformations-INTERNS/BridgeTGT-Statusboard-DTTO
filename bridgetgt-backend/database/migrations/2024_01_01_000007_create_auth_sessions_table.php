<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auth_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('username');
            $table->string('account_type');
            $table->text('avatar_url')->nullable();
            $table->text('access_token');
            $table->string('session_token')->unique();
            $table->boolean('is_authenticated')->default(true);
            $table->timestamp('expires_at');
            $table->timestamps();
            
            $table->index('session_token');
            $table->index('is_authenticated');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auth_sessions');
    }
};
