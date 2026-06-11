<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed demo data for Milestone 2 database verification.
     */
    public function run(): void
    {
        $demoPassword = Hash::make('demo-password');

        $users = collect([
            [
                'name' => 'Maya Carter',
                'username' => 'maya_demo',
                'email' => 'maya.demo@example.test',
                'bio' => 'Front-end learner who enjoys helping beginners get started.',
                'skills_offered' => 'HTML, CSS, beginner JavaScript',
                'skills_wanted' => 'Laravel API design',
            ],
            [
                'name' => 'Leo Nguyen',
                'username' => 'leo_demo',
                'email' => 'leo.demo@example.test',
                'bio' => 'Back-end student focused on PHP and database basics.',
                'skills_offered' => 'PHP debugging, MySQL basics',
                'skills_wanted' => 'UI design feedback',
            ],
            [
                'name' => 'Aisha Khan',
                'username' => 'aisha_demo',
                'email' => 'aisha.demo@example.test',
                'bio' => 'Language tutor who also wants help with technical skills.',
                'skills_offered' => 'English practice, study planning',
                'skills_wanted' => 'Portfolio website setup',
            ],
            [
                'name' => 'Noah Silva',
                'username' => 'noah_demo',
                'email' => 'noah.demo@example.test',
                'bio' => 'Community member interested in music, wellness, and collaboration.',
                'skills_offered' => 'Guitar basics, workout accountability',
                'skills_wanted' => 'Graphic design tips',
            ],
        ])->mapWithKeys(function (array $data) use ($demoPassword): array {
            $user = User::query()->updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'username' => $data['username'],
                    'password' => $demoPassword,
                    'bio' => $data['bio'],
                    'skills_offered' => $data['skills_offered'],
                    'skills_wanted' => $data['skills_wanted'],
                    'email_verified_at' => now(),
                ]
            );

            return [$data['username'] => $user];
        });

        $categories = Category::query()->pluck('id', 'name');

        $posts = collect([
            [
                'key' => 'html-tutoring',
                'username' => 'maya_demo',
                'category' => 'Tech & Digital',
                'title' => 'Offering beginner HTML and CSS tutoring',
                'description' => 'I can walk you through page structure, responsive basics, and debugging simple layouts.',
                'post_type' => 'offer',
                'payment_type' => 'free',
            ],
            [
                'key' => 'laravel-help',
                'username' => 'maya_demo',
                'category' => 'IT & Programming',
                'title' => 'Need help understanding Laravel service providers',
                'description' => 'Looking for a clear explanation of the request lifecycle and provider bootstrapping.',
                'post_type' => 'request',
                'payment_type' => 'exchange',
            ],
            [
                'key' => 'php-debugging',
                'username' => 'leo_demo',
                'category' => 'IT & Programming',
                'title' => 'Offering PHP debugging support for student projects',
                'description' => 'I can help track down common form handling and query issues in PHP school projects.',
                'post_type' => 'offer',
                'payment_type' => 'paid',
            ],
            [
                'key' => 'portfolio-design',
                'username' => 'leo_demo',
                'category' => 'Tech & Digital',
                'title' => 'Looking for feedback on a portfolio landing page',
                'description' => 'I want help improving spacing, typography, and visual hierarchy on my portfolio homepage.',
                'post_type' => 'request',
                'payment_type' => 'free',
            ],
            [
                'key' => 'english-practice',
                'username' => 'aisha_demo',
                'category' => 'Language & Translation',
                'title' => 'Offering weekly English conversation practice',
                'description' => 'Friendly speaking sessions for learners who want more confidence in casual conversation.',
                'post_type' => 'offer',
                'payment_type' => 'exchange',
            ],
            [
                'key' => 'study-planning',
                'username' => 'aisha_demo',
                'category' => 'Tutoring & Learning',
                'title' => 'Need help setting up a study dashboard in Notion',
                'description' => 'I need a simple structure for tracking assignments, revision blocks, and deadlines.',
                'post_type' => 'request',
                'payment_type' => 'free',
            ],
            [
                'key' => 'guitar-basics',
                'username' => 'noah_demo',
                'category' => 'Moving & Music',
                'title' => 'Offering beginner guitar sessions for absolute starters',
                'description' => 'I can help with chord transitions, rhythm practice, and building a simple routine.',
                'post_type' => 'offer',
                'payment_type' => 'paid',
            ],
            [
                'key' => 'fitness-buddy',
                'username' => 'noah_demo',
                'category' => 'Health & Wellness',
                'title' => 'Looking for an accountability buddy for home workouts',
                'description' => 'I want someone to check in twice a week and share progress on workout consistency.',
                'post_type' => 'request',
                'payment_type' => 'exchange',
            ],
            [
                'key' => 'translation-help',
                'username' => 'maya_demo',
                'category' => 'Language & Translation',
                'title' => 'Need help translating a short event flyer into Spanish',
                'description' => 'The flyer is for a student tech meetup and needs friendly, natural wording.',
                'post_type' => 'request',
                'payment_type' => 'paid',
            ],
            [
                'key' => 'database-basics',
                'username' => 'leo_demo',
                'category' => 'Tutoring & Learning',
                'title' => 'Offering database basics for beginners',
                'description' => 'I can explain tables, primary keys, and simple relationships using practical examples.',
                'post_type' => 'offer',
                'payment_type' => 'free',
            ],
        ])->mapWithKeys(function (array $data) use ($users, $categories): array {
            $post = Post::query()->updateOrCreate(
                ['title' => $data['title']],
                [
                    'user_id' => $users[$data['username']]->id,
                    'category_id' => $categories[$data['category']],
                    'description' => $data['description'],
                    'post_type' => $data['post_type'],
                    'payment_type' => $data['payment_type'],
                    'image_path' => null,
                ]
            );

            return [$data['key'] => $post];
        });

        $comments = [];

        $comments['html-top-level'] = Comment::query()->updateOrCreate(
            [
                'post_id' => $posts['html-tutoring']->id,
                'body' => 'This would be really helpful for someone moving from plain HTML into responsive layouts.',
            ],
            [
                'user_id' => $users['aisha_demo']->id,
                'parent_id' => null,
            ]
        );

        $comments['html-reply'] = Comment::query()->updateOrCreate(
            [
                'post_id' => $posts['html-tutoring']->id,
                'body' => 'I can include a small flexbox exercise too if that would make the sessions more practical.',
            ],
            [
                'user_id' => $users['maya_demo']->id,
                'parent_id' => $comments['html-top-level']->id,
            ]
        );

        $comments['laravel-top-level'] = Comment::query()->updateOrCreate(
            [
                'post_id' => $posts['laravel-help']->id,
                'body' => 'I can explain the container bindings and the boot sequence with a simple example app.',
            ],
            [
                'user_id' => $users['leo_demo']->id,
                'parent_id' => null,
            ]
        );

        $comments['laravel-reply'] = Comment::query()->updateOrCreate(
            [
                'post_id' => $posts['laravel-help']->id,
                'body' => 'That sounds great. A request lifecycle diagram would help me a lot too.',
            ],
            [
                'user_id' => $users['maya_demo']->id,
                'parent_id' => $comments['laravel-top-level']->id,
            ]
        );

        $comments['fitness-top-level'] = Comment::query()->updateOrCreate(
            [
                'post_id' => $posts['fitness-buddy']->id,
                'body' => 'I am also trying to stay consistent with short home workouts and could join you.',
            ],
            [
                'user_id' => $users['aisha_demo']->id,
                'parent_id' => null,
            ]
        );

        $conversationOne = $this->seedConversation(
            $posts['laravel-help'],
            $users['maya_demo'],
            $users['leo_demo']
        );

        $conversationTwo = $this->seedConversation(
            $posts['portfolio-design'],
            $users['leo_demo'],
            $users['noah_demo']
        );

        $this->seedMessages($conversationOne, collect([
            [
                'sender' => $users['maya_demo'],
                'recipient' => $users['leo_demo'],
                'body' => 'Hi Leo, I am free after class on Wednesday if you want to walk through service providers.',
                'read_at' => now(),
            ],
            [
                'sender' => $users['leo_demo'],
                'recipient' => $users['maya_demo'],
                'body' => 'That works. I can bring a simple demo app and explain how the bindings are resolved.',
                'read_at' => null,
            ],
        ]));

        $this->seedMessages($conversationTwo, collect([
            [
                'sender' => $users['leo_demo'],
                'recipient' => $users['noah_demo'],
                'body' => 'Can you review the spacing and hierarchy on my portfolio hero section?',
                'read_at' => now(),
            ],
            [
                'sender' => $users['noah_demo'],
                'recipient' => $users['leo_demo'],
                'body' => 'Yes, I think the heading contrast is good but the call-to-action needs stronger emphasis.',
                'read_at' => null,
            ],
        ]));
    }

    /**
     * Create or reuse a conversation with normalized participant IDs.
     */
    private function seedConversation(Post $post, User $firstUser, User $secondUser): Conversation
    {
        [$userOneId, $userTwoId] = $this->normalizeParticipants($firstUser->id, $secondUser->id);

        return Conversation::query()->firstOrCreate([
            'post_id' => $post->id,
            'user_one_id' => $userOneId,
            'user_two_id' => $userTwoId,
        ]);
    }

    /**
     * Seed a small ordered list of messages for one conversation.
     *
     * @param  Collection<int, array{sender: User, recipient: User, body: string, read_at: \Illuminate\Support\Carbon|null}>  $messages
     */
    private function seedMessages(Conversation $conversation, Collection $messages): void
    {
        foreach ($messages as $messageData) {
            Message::query()->firstOrCreate(
                [
                    'conversation_id' => $conversation->id,
                    'body' => $messageData['body'],
                ],
                [
                    'sender_id' => $messageData['sender']->id,
                    'recipient_id' => $messageData['recipient']->id,
                    'read_at' => $messageData['read_at'],
                ]
            );
        }
    }

    /**
     * Normalize the participant order for the unique database constraint.
     *
     * @return array{0: int, 1: int}
     */
    private function normalizeParticipants(int $firstId, int $secondId): array
    {
        return $firstId < $secondId
            ? [$firstId, $secondId]
            : [$secondId, $firstId];
    }
}
