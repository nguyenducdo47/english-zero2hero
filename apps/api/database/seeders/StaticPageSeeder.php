<?php

namespace Database\Seeders;

use App\Models\StaticPage;
use Illuminate\Database\Seeder;

class StaticPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'about',
                'page_kind' => StaticPage::KIND_GENERIC,
                'sort_order' => 10,
                'translations' => [
                    'vi' => [
                        'title' => 'Về chúng tôi',
                        'excerpt' => 'English Zero2Hero — lộ trình grammar và luyện thi cho người Việt.',
                        'body' => '<p><strong>English Zero2Hero</strong> giúp bạn ôn 12 thì tiếng Anh, làm quiz và chuẩn bị TOEIC/IELTS từ con số không.</p><p>Chúng tôi giải thích bằng tiếng Việt, có ví dụ thực tế và lộ trình rõ ràng — phù hợp người đi làm và sinh viên.</p><p>Nội dung được cập nhật trên portal; bạn có thể chỉnh trang này trong Admin → Trang tĩnh.</p>',
                    ],
                    'en' => [
                        'title' => 'About us',
                        'excerpt' => 'English Zero2Hero — grammar and exam prep for Vietnamese learners.',
                        'body' => '<p><strong>English Zero2Hero</strong> helps you master 12 English tenses, practice quizzes, and prepare for TOEIC/IELTS from zero.</p><p>We explain in Vietnamese with real examples and a clear roadmap — built for students and working professionals.</p><p>You can edit this page anytime under Admin → Static pages.</p>',
                    ],
                ],
            ],
            [
                'slug' => 'blog',
                'page_kind' => StaticPage::KIND_BLOG,
                'sort_order' => 20,
                'translations' => [
                    'vi' => [
                        'title' => 'Blog',
                        'excerpt' => 'Mẹo học grammar và luyện thi.',
                        'body' => '<p>Mẹo học grammar và luyện thi — chọn bài bên dưới.</p>',
                    ],
                    'en' => [
                        'title' => 'Blog',
                        'excerpt' => 'Grammar tips and exam strategies.',
                        'body' => '<p>Grammar and exam tips — pick an article below.</p>',
                    ],
                ],
            ],
            [
                'slug' => 'news',
                'page_kind' => StaticPage::KIND_NEWS,
                'sort_order' => 30,
                'translations' => [
                    'vi' => [
                        'title' => 'Tin tức',
                        'excerpt' => 'Cập nhật sản phẩm English Zero2Hero.',
                        'body' => '<p>Thông báo và cập nhật sản phẩm — xem các tin bên dưới.</p>',
                    ],
                    'en' => [
                        'title' => 'News',
                        'excerpt' => 'Product updates from English Zero2Hero.',
                        'body' => '<p>Product announcements — see the latest items below.</p>',
                    ],
                ],
            ],
        ];

        foreach ($pages as $row) {
            $translations = $row['translations'];
            unset($row['translations']);

            /** @var StaticPage $page */
            $page = StaticPage::query()->updateOrCreate(
                ['slug' => $row['slug']],
                [
                    ...$row,
                    'is_published' => true,
                    'show_in_header' => true,
                    'show_in_footer' => true,
                ],
            );

            foreach ($translations as $locale => $attributes) {
                $page->syncTranslation($locale, $attributes);
            }
        }
    }
}
