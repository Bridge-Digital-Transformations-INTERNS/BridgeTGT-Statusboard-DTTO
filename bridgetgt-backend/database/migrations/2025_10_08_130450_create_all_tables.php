<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create projects table
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Create developers table
        Schema::create('developers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->text('avatar_url')->nullable();
            $table->timestamps();
        });

        // Create roles table
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('role_name')->unique();
            $table->timestamps();
        });

        // Create tasks table
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('phase');
            $table->enum('weight', ['light', 'medium', 'heavy']);
            $table->string('status');
            $table->date('startDate');
            $table->date('targetDate');
            $table->date('endDate')->nullable();
            $table->timestamps();
        });

        // Create developer_roles table
        Schema::create('developer_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('developer_id')->constrained('developers')->onDelete('cascade');
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['developer_id', 'role_id']);
        });

        // Create task_assignees table
        Schema::create('task_assignees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('developer_id')->constrained('developers')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['task_id', 'developer_id']);
        });

        // Create auth_sessions table
        Schema::create('auth_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('username');
            $table->enum('account_type', ['admin', 'github']);
            $table->text('avatar_url')->nullable();
            $table->text('access_token');
            $table->string('session_token')->unique();
            $table->boolean('is_authenticated')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            
            $table->index('username');
            $table->index('session_token');
        });

        // Create change_logs table
        Schema::create('change_logs', function (Blueprint $table) {
            $table->id();
            $table->string('username');
            $table->enum('action', ['create', 'update', 'delete']);
            $table->string('entity_type');
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('details')->nullable();
            $table->timestamps();
            
            $table->index('username');
            $table->index(['entity_type', 'entity_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('change_logs');
        Schema::dropIfExists('auth_sessions');
        Schema::dropIfExists('task_assignees');
        Schema::dropIfExists('developer_roles');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('developers');
        Schema::dropIfExists('projects');
    }
};
