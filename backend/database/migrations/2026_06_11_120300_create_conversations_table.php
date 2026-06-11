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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_one_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_two_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            // Later application logic must normalize participant IDs before insert
            // so this database-level uniqueness rule can prevent duplicate threads.
            $table->unique(
                ['post_id', 'user_one_id', 'user_two_id'],
                'conversations_unique_participants_per_post'
            );

            $table->index(['user_one_id', 'created_at'], 'conversations_user_one_created_at_index');
            $table->index(['user_two_id', 'created_at'], 'conversations_user_two_created_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
