<?php

namespace Database\Seeders;

use App\Models\ContentPost;
use Illuminate\Database\Seeder;

class ContentPostSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $posts = [
            [
                'channel' => ContentPost::CHANNEL_BLOG,
                'slug' => 'remember-12-tenses',
                'published_at' => $now->copy()->subDays(3),
                'translations' => [
                    'vi' => [
                        'title' => 'Cách nhớ 12 thì nhanh hơn',
                        'excerpt' => 'Bản đồ timeline + 3 câu hỏi Yes/No giúp bạn không nhầm thì.',
                        'body' => '<p>Học thì không phải học thuộc 12 tên — hãy đặt sự kiện trên <strong>timeline</strong> (quá khứ / hiện tại / tương lai) và hỏi: <em>đã xong chưa?</em>, <em>đang diễn ra?</em>, <em>trước một mốc nào?</em></p><p>Trên portal, mỗi thì có bài grammar và quiz — ôn theo nhóm Present → Past → Future → Perfect.</p>',
                    ],
                    'en' => [
                        'title' => 'Remember 12 tenses faster',
                        'excerpt' => 'A timeline map plus three yes/no questions to stop mixing tenses.',
                        'body' => '<p>Do not memorize twelve labels — place the event on a <strong>timeline</strong> and ask: <em>finished?</em>, <em>in progress?</em>, <em>before another point?</em></p><p>On the portal, each tense has a lesson and quizzes — study Present → Past → Future → Perfect groups.</p>',
                    ],
                ],
            ],
            [
                'channel' => ContentPost::CHANNEL_BLOG,
                'slug' => 'toeic-part-5-plan',
                'published_at' => $now->copy()->subDays(1),
                'translations' => [
                    'vi' => [
                        'title' => 'Kế hoạch 4 tuần TOEIC Part 5',
                        'excerpt' => '20 phút/ngày: grammar + 30 câu luyện có giải thích.',
                        'body' => '<p><strong>Tuần 1–2:</strong> ôn thì và collocation trong đề mẫu.</p><p><strong>Tuần 3:</strong> luyện đề Part 5 với mock exam trên site.</p><p><strong>Tuần 4:</strong> sửa lỗi lặp lại theo analytics tiến độ (nếu đã đăng nhập).</p>',
                    ],
                    'en' => [
                        'title' => 'Four-week TOEIC Part 5 plan',
                        'excerpt' => '20 minutes a day: grammar plus 30 explained drill items.',
                        'body' => '<p><strong>Weeks 1–2:</strong> review tenses and collocations from sample tests.</p><p><strong>Week 3:</strong> timed Part 5 sets via mock exams.</p><p><strong>Week 4:</strong> fix repeat mistakes using progress analytics when signed in.</p>',
                    ],
                ],
            ],
            [
                'channel' => ContentPost::CHANNEL_NEWS,
                'slug' => 'sitemap-admin',
                'published_at' => $now->copy()->subDays(2),
                'translations' => [
                    'vi' => [
                        'title' => 'Ra mắt quản lý Sitemap trong Admin',
                        'excerpt' => 'Xem URL index, URL tùy chỉnh và xóa cache SEO.',
                        'body' => '<p>Admin có trang <strong>Sitemap</strong> riêng: danh sách URL hệ thống, bật/tắt index, thêm URL thủ công.</p>',
                    ],
                    'en' => [
                        'title' => 'Admin Sitemap management',
                        'excerpt' => 'Inspect indexed URLs, custom entries, and clear SEO cache.',
                        'body' => '<p>The <strong>Sitemap</strong> admin page lists system URLs, toggles indexing, and supports custom URLs.</p>',
                    ],
                ],
            ],
            [
                'channel' => ContentPost::CHANNEL_NEWS,
                'slug' => 'static-pages-launch',
                'published_at' => $now,
                'translations' => [
                    'vi' => [
                        'title' => 'Trang tĩnh & bài Blog/Tin tức',
                        'excerpt' => 'Hub /blog và /news hiển thị card bài viết.',
                        'body' => '<p>Bạn quản lý hub trong <strong>Trang tĩnh</strong>, bài chi tiết trong <strong>Bài viết</strong> với URL <code>/blog/slug</code> hoặc <code>/news/slug</code>.</p>',
                    ],
                    'en' => [
                        'title' => 'Static pages and blog/news posts',
                        'excerpt' => 'Hubs at /blog and /news with post cards.',
                        'body' => '<p>Manage hubs under <strong>Static pages</strong> and articles under <strong>Posts</strong> at <code>/blog/slug</code> or <code>/news/slug</code>.</p>',
                    ],
                ],
            ],
        ];

        foreach ($posts as $row) {
            $translations = $row['translations'];
            unset($row['translations']);

            /** @var ContentPost $post */
            $post = ContentPost::query()->updateOrCreate(
                [
                    'channel' => $row['channel'],
                    'slug' => $row['slug'],
                ],
                [
                    'is_published' => true,
                    'published_at' => $row['published_at'],
                    'sort_order' => 0,
                ],
            );

            foreach ($translations as $locale => $attributes) {
                $post->syncTranslation($locale, $attributes);
            }
        }
    }
}
