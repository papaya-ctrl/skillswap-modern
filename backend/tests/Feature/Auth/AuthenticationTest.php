<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use DatabaseMigrations;

    public function test_registration_succeeds(): void
    {
        $response = $this->postJson('/register', [
            'name' => 'Alice Example',
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.message', 'Registration successful. Please log in.')
            ->assertJsonPath('data.user.name', 'Alice Example')
            ->assertJsonPath('data.user.username', 'alice')
            ->assertJsonPath('data.user.email', 'alice@example.com');

        $this->assertGuest();
        $this->assertDatabaseHas('users', [
            'email' => 'alice@example.com',
            'username' => 'alice',
        ]);
    }

    public function test_duplicate_email_is_rejected(): void
    {
        User::factory()->create([
            'email' => 'alice@example.com',
        ]);

        $response = $this->postJson('/register', [
            'name' => 'Another Alice',
            'username' => 'another-alice',
            'email' => 'alice@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_duplicate_username_is_rejected(): void
    {
        User::factory()->create([
            'username' => 'alice',
        ]);

        $response = $this->postJson('/register', [
            'name' => 'Alice Example',
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['username']);
    }

    public function test_password_confirmation_is_required(): void
    {
        $response = $this->postJson('/register', [
            'name' => 'Alice Example',
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password' => 'secret123',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['password']);
    }

    public function test_short_passwords_are_rejected(): void
    {
        $response = $this->postJson('/register', [
            'name' => 'Alice Example',
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['password']);
    }

    public function test_valid_login_succeeds(): void
    {
        $user = User::factory()->create([
            'name' => 'Alice Example',
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password' => 'secret123',
        ]);

        $response = $this->postJson('/login', [
            'email' => 'alice@example.com',
            'password' => 'secret123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.message', 'Login successful.')
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonPath('data.user.name', 'Alice Example')
            ->assertJsonPath('data.user.username', 'alice')
            ->assertJsonPath('data.user.email', 'alice@example.com');

        $this->assertAuthenticatedAs($user);
    }

    public function test_invalid_login_fails_with_a_safe_error(): void
    {
        User::factory()->create([
            'email' => 'alice@example.com',
            'password' => 'secret123',
        ]);

        $response = $this->postJson('/login', [
            'email' => 'alice@example.com',
            'password' => 'wrong-password',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email'])
            ->assertJsonPath('errors.email.0', 'The provided credentials are incorrect.');

        $this->assertGuest();
    }

    public function test_me_returns_401_when_unauthenticated(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
    }

    public function test_me_returns_the_current_user_when_authenticated(): void
    {
        $user = User::factory()->create([
            'name' => 'Alice Example',
            'username' => 'alice',
            'email' => 'alice@example.com',
        ]);

        $this->actingAs($user, 'web');

        $this->getJson('/api/me')
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'id' => $user->id,
                    'name' => 'Alice Example',
                    'username' => 'alice',
                    'email' => 'alice@example.com',
                ],
            ]);
    }

    public function test_logout_invalidates_the_session(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web');

        $this->postJson('/logout')
            ->assertOk()
            ->assertJsonPath('data.message', 'Logged out successfully.');

        $this->assertGuest();
        $this->getJson('/api/me')->assertUnauthorized();
    }
}
