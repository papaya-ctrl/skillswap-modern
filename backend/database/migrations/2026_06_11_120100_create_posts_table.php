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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained();
            $table->string('title', 120);
            $table->text('description');
            $table->enum('post_type', ['offer', 'request']);
            $table->enum('payment_type', ['free', 'paid', 'exchange']);
            $table->string('image_path')->nullable();
            $table->timestamps();

            $table->index(['post_type', 'created_at'], 'posts_type_created_at_index');
            $table->index(['category_id', 'post_type', 'created_at'], 'posts_filter_pagination_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
