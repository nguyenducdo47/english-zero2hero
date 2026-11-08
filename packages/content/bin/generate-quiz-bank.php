<?php

/**
 * Generate ~1000 grammar quiz items (hand-authored templates + combinatorial variants).
 *
 * Usage: php packages/content/bin/generate-quiz-bank.php
 * Output: packages/content/quiz-questions-bank.json
 */

declare(strict_types=1);

require_once __DIR__ . DIRECTORY_SEPARATOR . 'present-bank-families.php';

$outPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'quiz-questions-bank.json';
$targetTotal = 1000;
$perGroup = (int) ($targetTotal / 4);

$groups = [
    'present' => $perGroup,
    'past' => $perGroup,
    'future' => $perGroup,
    'perfect-continuous' => $perGroup,
];

/** @var list<array<string, mixed>> $all */
$all = [];

$seedBase = 0;
foreach ($groups as $slug => $count) {
    $all = array_merge($all, generateForGroup($slug, $count, $seedBase));
    $seedBase += $count;
}

$seen = [];
$dupeCount = 0;
foreach ($all as $item) {
    $key = ($item['tense_group_slug'] ?? '') . '|' . strtolower(preg_replace('/\s+/', ' ', trim((string) ($item['prompt_en'] ?? ''))) ?? '');
    if (isset($seen[$key])) {
        $dupeCount++;
    }
    $seen[$key] = true;
}

if ($dupeCount > 0) {
    fwrite(STDERR, "Warning: {$dupeCount} duplicate prompts within the same tense group (import will skip extras).\n");
}

$payload = ['questions' => $all];
$json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
if ($json === false) {
    fwrite(STDERR, "JSON encode failed\n");
    exit(1);
}

file_put_contents($outPath, $json . "\n");
fwrite(STDOUT, "Wrote " . count($all) . " questions to {$outPath}\n");

/**
 * @return list<array<string, mixed>>
 */
function generateForGroup(string $slug, int $count, int $seedBase): array
{
    $items = [];
    for ($i = 0; $i < $count; $i++) {
        $level = $i < (int) ($count * 0.4) ? 'basic' : ($i < (int) ($count * 0.75) ? 'intermediate' : 'advanced');
        $kind = $i % 10 < 7 ? 'multiple_choice' : 'fill_blank';
        $n = $seedBase + $i;
        $item = match ($slug) {
            'present' => buildPresent($n, $level, $kind),
            'past' => buildPast($n, $level, $kind),
            'future' => buildFuture($n, $level, $kind),
            default => buildPerfectContinuous($n, $level, $kind),
        };
        $items[] = $item;
    }

    return $items;
}

function levelLabel(string $level): string
{
    return match ($level) {
        'basic' => '[Cơ bản]',
        'intermediate' => '[Trung cấp]',
        default => '[Nâng cao]',
    };
}

/** @param list<string> $options */
function mcq(
    string $slug,
    string $level,
    string $promptEn,
    string $promptVi,
    array $options,
    int $correctIndex,
    string $explanationVi,
): array {
    return [
        'tense_group_slug' => $slug,
        'type' => 'multiple_choice',
        'prompt_en' => $promptEn,
        'prompt_vi' => $promptVi,
        'options' => $options,
        'correct_index' => $correctIndex,
        'explanation_vi' => levelLabel($level) . ' ' . $explanationVi,
    ];
}

function fill(
    string $slug,
    string $level,
    string $promptEn,
    string $promptVi,
    string $answer,
    string $explanationVi,
    array $synonyms = [],
): array {
    return [
        'tense_group_slug' => $slug,
        'type' => 'fill_blank',
        'prompt_en' => $promptEn,
        'prompt_vi' => $promptVi,
        'correct_answers' => [$answer],
        'synonyms' => $synonyms,
        'explanation_vi' => levelLabel($level) . ' ' . $explanationVi,
    ];
}

function pick(array $list, int $i): mixed
{
    return $list[$i % count($list)];
}

function subjectVi(string $subject): string
{
    return match ($subject) {
        'I' => 'Tôi',
        'You' => 'Bạn',
        'We' => 'Chúng tôi',
        'They' => 'Họ',
        'He' => 'Anh ấy',
        'She' => 'Cô ấy',
        'Tom' => 'Tom',
        'Anna' => 'Anna',
        'The children' => 'Bọn trẻ',
        'My parents' => 'Bố mẹ tôi',
        default => $subject,
    };
}

/** Ngữ cảnh đề bài tiếng Việt (khớp nghĩa với phần tiếng Anh). */
function objectPhraseVi(array $v): string
{
    return match ($v['at']) {
        'at the office' => 'ở văn phòng',
        'English' => 'tiếng Anh',
        'novels' => 'tiểu thuyết',
        'dinner' => 'bữa tối',
        'tennis' => 'tennis',
        'abroad' => 'nước ngoài',
        'reports' => 'báo cáo',
        'to work' => 'đi làm',
        'the piano' => 'đàn piano',
        'the kitchen' => 'nhà bếp',
        'every morning' => 'mỗi sáng',
        default => $v['vn'],
    };
}

function habitVi(int $i): string
{
    return pick(
        ['mỗi ngày', 'mỗi tuần', 'thường', 'thường xuyên', 'đôi khi', 'vào thứ Hai', 'hai lần mỗi tháng'],
        $i,
    );
}

function habitEn(int $i): string
{
    return pick(
        ['every day', 'every week', 'usually', 'often', 'sometimes', 'on Mondays', 'twice a month'],
        $i,
    );
}

function nowVi(int $i): string
{
    return pick(
        ['ngay lúc này', 'lúc này', 'hôm nay', 'tuần này', 'dạo này'],
        $i,
    );
}

function nowEn(int $i): string
{
    return pick(
        ['right now', 'at the moment', 'today', 'this week', 'these days'],
        $i,
    );
}

function pastTimeVi(int $i): string
{
    return pick(
        ['hôm qua', 'đêm qua', 'năm 2010', 'hai ngày trước', 'mùa hè năm ngoái', 'khi tôi 10 tuổi'],
        $i,
    );
}

function pastTimeEn(int $i): string
{
    return pick(
        ['yesterday', 'last night', 'in 2010', 'two days ago', 'last summer', 'when I was ten'],
        $i,
    );
}

/** @return array{en: string, vi: string, options: list<string>, correct: int, explain: string} */
function generalTruthFact(int $i): array
{
    static $facts = [
        ['en' => 'The sun ___ in the east.', 'vi' => 'Mặt trời ___ ở phía đông.', 'opts' => ['rises', 'is rising', 'rose', 'has risen'], 'c' => 0, 'ex' => 'Sự thật hiển nhiên → present simple.'],
        ['en' => 'Water ___ at 100°C at sea level.', 'vi' => 'Nước ___ ở 100°C ở mực nước biển.', 'opts' => ['boils', 'is boiling', 'boiled', 'has boiled'], 'c' => 0, 'ex' => 'Sự thật khoa học → present simple.'],
        ['en' => 'Ice ___ at 0°C.', 'vi' => 'Đá ___ ở 0°C.', 'opts' => ['melts', 'is melting', 'melted', 'has melted'], 'c' => 0, 'ex' => 'Sự thật khoa học → present simple.'],
        ['en' => 'Sound ___ faster in water than in air.', 'vi' => 'Âm thanh ___ nhanh hơn trong nước so với trong không khí.', 'opts' => ['travels', 'is traveling', 'traveled', 'has traveled'], 'c' => 0, 'ex' => 'Sự thật khoa học → present simple.'],
        ['en' => 'The Moon ___ around the Earth.', 'vi' => 'Mặt Trăng ___ quanh Trái Đất.', 'opts' => ['orbits', 'is orbiting', 'orbited', 'has orbited'], 'c' => 0, 'ex' => 'Sự thật hiển nhiên → present simple.'],
        ['en' => 'Plants ___ carbon dioxide for photosynthesis.', 'vi' => 'Thực vật ___ khí CO₂ để quang hợp.', 'opts' => ['use', 'are using', 'used', 'have used'], 'c' => 0, 'ex' => 'Sự thật khoa học → present simple.'],
        ['en' => 'A year ___ 365 days (in a common year).', 'vi' => 'Một năm thường ___ 365 ngày.', 'opts' => ['has', 'is having', 'had', 'has had'], 'c' => 0, 'ex' => 'Sự thật hiển nhiên → present simple.'],
        ['en' => 'Honey ___ spoil easily.', 'vi' => 'Mật ong ___ dễ bị hỏng.', 'opts' => ["doesn't", "isn't", "didn't", "hasn't"], 'c' => 0, 'ex' => 'Sự thật hiển nhiên → present simple phủ định.'],
        ['en' => 'Vegetables ___ vitamins.', 'vi' => 'Rau củ ___ vitamin.', 'opts' => ['contain', 'are containing', 'contained', 'have contained'], 'c' => 0, 'ex' => 'Sự thật khoa học → present simple.'],
        ['en' => 'Fish ___ in water.', 'vi' => 'Cá ___ dưới nước.', 'opts' => ['live', 'are living', 'lived', 'have lived'], 'c' => 0, 'ex' => 'Sự thật hiển nhiên → present simple.'],
        ['en' => 'The Pacific ___ the largest ocean.', 'vi' => 'Thái Bình Dương ___ đại dương lớn nhất.', 'opts' => ['is', 'are', 'was', 'has been'], 'c' => 0, 'ex' => 'Sự thật địa lý → present simple.'],
        ['en' => 'Iron ___ when it rusts.', 'vi' => 'Sắt ___ khi bị gỉ.', 'opts' => ['expands', 'is expanding', 'expanded', 'has expanded'], 'c' => 0, 'ex' => 'Mô tả quá trình → present simple.'],
        ['en' => 'Children ___ faster than adults.', 'vi' => 'Trẻ em ___ nhanh hơn người lớn.', 'opts' => ['learn', 'are learning', 'learned', 'have learned'], 'c' => 0, 'ex' => 'Sự thật chung → present simple.'],
        ['en' => 'October ___ before November.', 'vi' => 'Tháng Mười ___ trước tháng Mười Một.', 'opts' => ['comes', 'is coming', 'came', 'has come'], 'c' => 0, 'ex' => 'Thứ tự thời gian → present simple.'],
    ];

    $f = pick($facts, $i);

    return [
        'en' => $f['en'],
        'vi' => $f['vi'],
        'options' => $f['opts'],
        'correct' => $f['c'],
        'explain' => $f['ex'],
    ];
}

/**
 * @return array<string, mixed>
 */
function buildPresent(int $i, string $level, string $kind): array
{
    $subjects = [
        'I', 'You', 'We', 'They', 'He', 'She', 'Tom', 'Anna', 'The children', 'My parents',
        'Linh', 'Minh', 'Our team', 'The students', 'My boss', 'Her brother', 'The manager',
        'Those tourists', 'My neighbor', 'The doctor', 'Bao', 'Hana', 'The nurses', 'Our coach',
    ];
    $verbs = [
        ['w' => 'work', 'ws' => 'works', 'ing' => 'working', 'ed' => 'worked', 'vn' => 'làm việc', 'at' => 'at the office'],
        ['w' => 'study', 'ws' => 'studies', 'ing' => 'studying', 'ed' => 'studied', 'vn' => 'học', 'at' => 'English'],
        ['w' => 'play', 'ws' => 'plays', 'ing' => 'playing', 'ed' => 'played', 'vn' => 'chơi', 'at' => 'tennis'],
        ['w' => 'read', 'ws' => 'reads', 'ing' => 'reading', 'ed' => 'read', 'vn' => 'đọc', 'at' => 'novels'],
        ['w' => 'cook', 'ws' => 'cooks', 'ing' => 'cooking', 'ed' => 'cooked', 'vn' => 'nấu', 'at' => 'dinner'],
        ['w' => 'travel', 'ws' => 'travels', 'ing' => 'traveling', 'ed' => 'traveled', 'vn' => 'đi du lịch', 'at' => 'abroad'],
        ['w' => 'write', 'ws' => 'writes', 'ing' => 'writing', 'ed' => 'wrote', 'vn' => 'viết', 'at' => 'reports'],
        ['w' => 'drive', 'ws' => 'drives', 'ing' => 'driving', 'ed' => 'drove', 'vn' => 'lái xe', 'at' => 'to work'],
        ['w' => 'practice', 'ws' => 'practices', 'ing' => 'practicing', 'ed' => 'practiced', 'vn' => 'luyện tập', 'at' => 'the piano'],
        ['w' => 'clean', 'ws' => 'cleans', 'ing' => 'cleaning', 'ed' => 'cleaned', 'vn' => 'dọn dẹp', 'at' => 'the kitchen'],
        ['w' => 'exercise', 'ws' => 'exercises', 'ing' => 'exercising', 'ed' => 'exercised', 'vn' => 'tập thể dục', 'at' => 'every morning'],
    ];

    return buildPresentFromFamily($i, $level, $kind, $subjects, $verbs);
}

/**
 * @return array<string, mixed>
 */
function buildPast(int $i, string $level, string $kind): array
{
    $verbs = [
        ['w' => 'visit', 'ed' => 'visited', 'ing' => 'visiting', 'vn' => 'thăm'],
        ['w' => 'finish', 'ed' => 'finished', 'ing' => 'finishing', 'vn' => 'hoàn thành'],
        ['w' => 'call', 'ed' => 'called', 'ing' => 'calling', 'vn' => 'gọi'],
        ['w' => 'lose', 'ed' => 'lost', 'ing' => 'losing', 'vn' => 'mất'],
        ['w' => 'build', 'ed' => 'built', 'ing' => 'building', 'vn' => 'xây'],
        ['w' => 'forget', 'ed' => 'forgot', 'ing' => 'forgetting', 'vn' => 'quên'],
    ];
    $v = pick($verbs, $i);
    $pattern = intdiv($i, 25) % 10;

    if ($kind === 'fill_blank') {
        return match ($i % 5) {
            0 => fill('past', $level, "By 6 p.m. she had already ___ ({$v['w']}) dinner.", 'Đến 6 giờ tối cô ấy đã ' . $v['vn'] . ' bữa tối rồi.', $v['ed'], 'Past perfect: hành động xảy ra trước một mốc trong quá khứ.'),
            1 => fill('past', $level, "While I ___ ({$v['w']}), the power went out.", 'Trong lúc tôi đang ' . $v['vn'] . ', điện bị mất.', 'was ' . $v['ing'], 'Past continuous: was/were + V-ing (hành động nền).'),
            2 => fill('past', $level, "They ___ (not / {$v['w']}) him last week.", 'Tuần trước họ không ' . $v['vn'] . ' anh ấy.', "didn't {$v['w']}", 'Past simple phủ định: didn\'t + V nguyên mẫu.'),
            default => fill('past', $level, "I ___ ({$v['w']}) my keys before I left.", 'Tôi đã ' . $v['vn'] . ' chìa khóa trước khi ra đi.', 'had ' . $v['ed'], 'Past perfect trước hành động quá khứ khác.', ['had ' . $v['ed']]),
        };
    }

    $name = pick(['She', 'He', 'They', 'We', 'I', 'Tom', 'Linh', 'Minh', 'Anna', 'Our team'], $i * 2 + 1);
    $nv = subjectVi($name);

    return match ($pattern) {
        0 => mcq('past', $level, "{$name} ___ {$v['ed']} " . pastTimeEn($i) . '.', "{$nv} đã {$v['vn']} " . pastTimeVi($i) . '.', [$v['ed'], $v['w'], $v['ing'], 'has ' . $v['ed']], 0, 'Mốc thời gian đã chốt → past simple.'),
        1 => mcq(
            'past', $level,
            'While we ___ ' . pick(['dinner', 'lunch', 'breakfast', 'a snack'], $i) . ', someone ___ the ' . pick(['door', 'window', 'gate'], $i + 2) . '.',
            'Trong lúc chúng tôi đang ăn ' . pick(['bữa tối', 'bữa trưa', 'bữa sáng', 'đồ ăn nhẹ'], $i) . ', có người gõ ' . pick(['cửa', 'cửa sổ', 'cổng'], $i + 2) . '.',
            ['were having / knocked', 'had / knocks', 'have / knocked', 'are having / knock'],
            0,
            'Past continuous (nền) + past simple (chen ngang).',
        ),
        2 => mcq('past', $level, "{$name} ___ the movie before it ended.", "{$nv} đã {$v['vn']} xong trước khi phim kết thúc.", ['had ' . $v['ed'], $v['ed'], 'was ' . $v['ing'], 'has ' . $v['ed']], 0, 'Hành động trước → past perfect.'),
        3 => mcq('past', $level, "Did you ___ him " . pastTimeEn($i) . '?', 'Bạn có ' . $v['vn'] . ' anh ấy ' . pastTimeVi($i) . ' không?', [$v['w'], $v['ed'], $v['ing'], $v['ws'] ?? $v['w'] . 's'], 0, 'Did + S + V nguyên mẫu (past simple hỏi).'),
        4 => mcq('past', $level, "{$name} ___ TV when I saw him.", "Lúc tôi thấy {$nv}, {$nv} đang xem TV.", ['was watching', 'watched', 'has watched', 'watches'], 0, 'When + past simple → hành động đang diễn ra dùng past continuous.'),
        5 => mcq(
            'past', $level,
            'I ___ to ' . pick(['Paris', 'London', 'Tokyo', 'Sydney', 'Berlin', 'Rome', 'Seoul', 'Bangkok'], $i) . ' in ' . (2015 + ($i % 9)) . '.',
            'Tôi đã đến ' . pick(['Paris', 'London', 'Tokyo', 'Sydney', 'Berlin', 'Roma', 'Seoul', 'Bangkok'], $i + 1) . ' năm ' . (2015 + ($i % 9)) . '.',
            ['went', 'have gone', 'was going', 'go'],
            0,
            'In + năm cụ thể đã qua → past simple.',
        ),
        6 => mcq('past', $level, "{$name} ___ never ___ such a storm before that night.", "{$nv} chưa từng thấy bão dữ như vậy trước đêm đó.", ['had / seen', 'has / seen', 'was / seeing', 'did / see'], 0, 'Before một mốc quá khứ → past perfect + ever/never.'),
        7 => mcq(
            'past', $level,
            'They ___ the ' . pick(['bridge', 'hospital', 'school', 'tower'], $i) . ' for ' . (2 + ($i % 8)) . ' months before it opened.',
            'Họ đã xây ' . pick(['cầu', 'bệnh viện', 'trường', 'tháp'], $i) . ' được ' . (2 + ($i % 8)) . ' tháng trước khi khánh thành.',
            ['had been building', 'built', 'were building', 'have built'],
            0,
            'Hành động kéo dài trước mốc quá khứ → past perfect continuous.',
        ),
        8 => mcq('past', $level, "{$name} ___ late because the bus broke down.", "{$nv} đến muộn vì xe buýt hỏng.", ['arrived', 'was arriving', 'had arrived', 'arrives'], 0, 'Hành động hoàn thành trong quá khứ → past simple.'),
        9 => mcq(
            'past', $level,
            'At ' . (6 + ($i % 6)) . ' p.m. last night I ___ my ' . pick(['homework', 'report', 'project', 'essay'], $i) . '.',
            'Lúc ' . (18 + ($i % 6)) . ' giờ hôm qua tôi đang làm ' . pick(['bài tập', 'báo cáo', 'dự án', 'bài luận'], $i) . '.',
            ['was doing', 'did', 'had done', 'do'],
            0,
            'At + thời điểm cụ thể trong quá khứ → past continuous.',
        ),
        10 => mcq('past', $level, "{$name} ___ up early and ___ a shower.", "{$nv} dậy sớm và đi tắm.", ['got / took', 'gets / takes', 'was getting / was taking', 'had got / had taken'], 0, 'Chuỗi hành động liên tiếp trong quá khứ → past simple.'),
        default => mcq(
            'past', $level,
            'How long ___ you ___ in ' . pick(['Hanoi', 'Da Nang', 'Hue', 'Saigon'], $i) . ' before you moved?',
            'Bạn đã sống ở ' . pick(['Hà Nội', 'Đà Nẵng', 'Huế', 'Sài Gòn'], $i) . ' bao lâu trước khi chuyển đi?',
            ['had ... lived', 'did ... live', 'were ... living', 'have ... lived'],
            0,
            'How long + past perfect (trước hành động quá khứ).',
        ),
    };
}

/**
 * @return array<string, mixed>
 */
function buildFuture(int $i, string $level, string $kind): array
{
    $verbs = [
        ['w' => 'meet', 'ing' => 'meeting', 'vn' => 'gặp'],
        ['w' => 'start', 'ing' => 'starting', 'vn' => 'bắt đầu'],
        ['w' => 'travel', 'ing' => 'traveling', 'vn' => 'đi du lịch'],
        ['w' => 'send', 'ing' => 'sending', 'vn' => 'gửi'],
        ['w' => 'arrive', 'ing' => 'arriving', 'vn' => 'đến'],
    ];
    $v = pick($verbs, $i);
    $pattern = intdiv($i, 25) % 10;

    if ($kind === 'fill_blank') {
        return match ($i % 5) {
            0 => fill('future', $level, "This time tomorrow I ___ ({$v['w']}) my client.", 'Giờ này ngày mai tôi sẽ đang ' . $v['vn'] . ' khách.', 'will be ' . $v['ing'], 'Future continuous: will be + V-ing tại thời điểm trong tương lai.'),
            1 => fill('future', $level, "We ___ ({$v['w']}) you as soon as we land.", 'Chúng tôi sẽ ' . $v['vn'] . ' bạn ngay khi hạ cánh.', 'will ' . $v['w'], 'Time clause: as soon as + present simple → main clause future.'),
            2 => fill('future', $level, "They are ___ ({$v['w']}) us tonight.", 'Tối nay họ sẽ ' . $v['vn'] . ' chúng ta.', 'going to ' . $v['w'], 'Going to: kế hoạch / bằng chứng đã có.'),
            default => fill('future', $level, "By next June she ___ (finish) the course.", 'Đến tháng Sáu tới cô ấy sẽ hoàn thành khóa học.', 'will have finished', 'Future perfect: by + mốc tương lai → will have + V3.'),
        };
    }

    $name = pick(['I', 'We', 'She', 'They', 'Tom'], $i);
    $nv = subjectVi($name);

    return match ($pattern) {
        0 => mcq(
            'future', $level,
            'Look at those ' . pick(['clouds', 'dark skies', 'storm clouds'], $i) . '! It ___ rain ' . pick(['soon', 'this afternoon', 'tonight'], $i + 1) . '.',
            'Nhìn ' . pick(['mây', 'bầu trời đen', 'mây bão'], $i) . ' kìa! Trời sắp mưa ' . pick(['sớm', 'chiều nay', 'tối nay'], $i + 1) . '.',
            ['is going to', 'will', 'rains', 'rained'],
            0,
            'Dự đoán có bằng chứng → going to.',
        ),
        1 => mcq('future', $level, "I think {$name} ___ pass the exam.", "Tôi nghĩ {$nv} sẽ đỗ kỳ thi.", ['will', 'is going to', 'passes', 'passed'], 0, 'Ý kiến / dự đoán chủ quan → will.'),
        2 => mcq('future', $level, "{$name} ___ you tomorrow at 9.", "{$nv} sẽ {$v['vn']} bạn lúc 9 giờ ngày mai.", ['will ' . $v['w'], 'is ' . $v['ing'], $v['w'] . 's', 'will be ' . $v['ing']], 0, 'Lịch hẹn tương lai → will + V.'),
        3 => mcq(
            'future', $level,
            'We ___ ' . pick(['dinner', 'lunch', 'a meeting'], $i) . ' at ' . (6 + ($i % 5)) . ' tonight.',
            'Tối nay lúc ' . (18 + ($i % 5)) . ' chúng tôi sẽ đang ' . pick(['ăn tối', 'ăn trưa', 'họp'], $i) . '.',
            ['will be having', 'will have', 'have', 'are having'],
            0,
            'Thời điểm cụ thể trong tương lai → future continuous.',
        ),
        4 => mcq(
            'future', $level,
            'By ' . (2028 + ($i % 12)) . ' scientists ___ a cure for ' . pick(['cancer', 'malaria', 'diabetes', 'flu'], $i) . '.',
            'Đến năm ' . (2028 + ($i % 12)) . ' các nhà khoa học sẽ đã tìm ra thuốc chữa ' . pick(['ung thư', 'sốt rét', 'tiểu đường', 'cúm'], $i) . '.',
            ['will have found', 'will find', 'find', 'found'],
            0,
            'By + mốc tương lai → future perfect.',
        ),
        5 => mcq(
            'future', $level,
            'I promise I ___ late for ' . pick(['class', 'work', 'the interview', 'the flight'], $i) . ' again.',
            'Tôi hứa sẽ không muộn ' . pick(['giờ học', 'làm', 'buổi phỏng vấn', 'chuyến bay'], $i) . ' nữa.',
            ["won't be", "am not", "don't be", "wasn't"],
            0,
            'Promise / offer → will.',
        ),
        6 => mcq(
            'future', $level,
            'The train ___ at platform ' . (1 + ($i % 8)) . ' at ' . (6 + ($i % 12)) . ':' . str_pad((string) (($i % 6) * 10), 2, '0', STR_PAD_LEFT) . '.',
            'Tàu khởi hành ở sân ga ' . (1 + ($i % 8)) . ' lúc ' . (6 + ($i % 12)) . ' giờ ' . (($i % 6) * 10) . ' phút.',
            ['leaves', 'will leave', 'is leaving', 'left'],
            0,
            'Lịch trình cố định → present simple (future meaning).',
        ),
        7 => mcq('future', $level, "{$name} ___ to study medicine next year.", "{$nv} dự định học y khoa năm sau.", ['is going to', 'will', 'studies', 'studied'], 0, 'Kế hoạch đã quyết → going to.'),
        8 => mcq('future', $level, "Wait! I ___ you with that bag.", 'Đợi đã! Tôi sẽ giúp bạn xách túi.', ['will help', 'am helping', 'help', 'helped'], 0, 'Quyết định tức thì → will.'),
        9 => mcq('future', $level, "When you ___ , call me.", 'Khi bạn đến nơi, hãy gọi cho tôi.', ['arrive', 'will arrive', 'arrived', 'are arriving'], 0, 'When + present simple trong mệnh đề thời gian.'),
        10 => mcq(
            'future', $level,
            'This time next week we ___ on the beach in ' . pick(['Da Nang', 'Nha Trang', 'Phu Quoc', 'Bali'], $i) . '.',
            'Giờ này tuần sau chúng tôi sẽ đang ở bãi biển ' . pick(['Đà Nẵng', 'Nha Trang', 'Phú Quốc', 'Bali'], $i) . '.',
            ['will be lying', 'will lie', 'lie', 'are lying'],
            0,
            'This time + future continuous.',
        ),
        default => mcq(
            'future', $level,
            'I ___ the ' . pick(['report', 'proposal', 'slides', 'budget'], $i) . ' before the meeting starts at ' . (8 + ($i % 4)) . ' a.m.',
            'Tôi sẽ hoàn thành ' . pick(['báo cáo', 'đề xuất', 'slide', 'ngân sách'], $i) . ' trước khi cuộc họp bắt đầu lúc ' . (8 + ($i % 4)) . ' giờ sáng.',
            ['will have finished', 'will finish', 'finish', 'finished'],
            0,
            'Hành động hoàn thành trước mốc tương lai → future perfect.',
        ),
    };
}

/**
 * @return array<string, mixed>
 */
function buildPerfectContinuous(int $i, string $level, string $kind): array
{
    $verbs = [
        ['w' => 'wait', 'ing' => 'waiting', 'ed' => 'waited', 'vn' => 'chờ'],
        ['w' => 'rain', 'ing' => 'raining', 'ed' => 'rained', 'vn' => 'mưa'],
        ['w' => 'learn', 'ing' => 'learning', 'ed' => 'learned', 'vn' => 'học'],
        ['w' => 'work', 'ing' => 'working', 'ed' => 'worked', 'vn' => 'làm việc'],
    ];
    $v = pick($verbs, $i);
    $pattern = intdiv($i, 25) % 10;

    if ($kind === 'fill_blank') {
        return match ($i % 5) {
            0 => fill('perfect-continuous', $level, "She has been ___ ({$v['w']}) since noon.", "Cô ấy đã {$v['vn']} từ trưa.", $v['ing'], 'Present perfect continuous: has been + V-ing.'),
            1 => fill('perfect-continuous', $level, "They had been ___ ({$v['w']}) for an hour when we arrived.", 'Họ đã ' . $v['vn'] . ' được một tiếng khi chúng tôi đến.', $v['ing'], 'Past perfect continuous.'),
            2 => fill('perfect-continuous', $level, "It ___ ({$v['w']}) all night.", 'Trời ' . $v['vn'] . ' suốt đêm.', 'has been ' . $v['ing'], 'Hành động kéo dài đến hiện tại → present perfect continuous.'),
            default => fill('perfect-continuous', $level, "By July I ___ ({$v['w']}) here for ten years.", 'Đến tháng Bảy tôi sẽ đã ' . $v['vn'] . ' ở đây 10 năm.', 'will have been ' . $v['ing'], 'Future perfect continuous: will have been + V-ing.'),
        };
    }

    return match ($pattern) {
        0 => mcq(
            'perfect-continuous', $level,
            'How long ___ you ___ ' . pick(['English', 'Japanese', 'French', 'coding'], $i) . '?',
            'Bạn đã học ' . pick(['tiếng Anh', 'tiếng Nhật', 'tiếng Pháp', 'lập trình'], $i) . ' bao lâu rồi?',
            ['have / been learning', 'did / learn', 'are / learning', 'will / learn'],
            0,
            'How long → present perfect continuous.',
        ),
        1 => mcq(
            'perfect-continuous', $level,
            'I am tired because I ___ ' . pick(['all day', 'since 6 a.m.', 'for ten hours'], $i) . '.',
            'Tôi mệt vì đã ' . pick(['làm việc cả ngày', 'làm việc từ 6 giờ sáng', 'làm việc suốt mười tiếng'], $i) . '.',
            ['have been working', 'worked', 'am working', 'work'],
            0,
            'Because + hậu quả hiện tại → present perfect continuous.',
        ),
        2 => mcq(
            'perfect-continuous', $level,
            'She ___ for ' . (1 + ($i % 4)) . ' hours when the bus finally came.',
            'Cô ấy đã chờ ' . (1 + ($i % 4)) . ' tiếng khi xe buýt đến.',
            ['had been waiting', 'was waiting', 'has waited', 'waited'],
            0,
            'Past perfect continuous + when.',
        ),
        3 => mcq(
            'perfect-continuous', $level,
            'They ___ ' . (2 + ($i % 6)) . ' projects this year.',
            'Họ đã hoàn thành ' . (2 + ($i % 6)) . ' dự án năm nay.',
            ['have completed', 'completed', 'have been completing', 'were completing'],
            0,
            'Kết quả đếm được → present perfect (hoàn thành).',
        ),
        4 => mcq(
            'perfect-continuous', $level,
            'By next month he ___ here for ' . (3 + ($i % 7)) . ' years.',
            'Đến tháng sau anh ấy sẽ ở đây được ' . (3 + ($i % 7)) . ' năm.',
            ['will have been living', 'will live', 'lives', 'has lived'],
            0,
            'By + future → future perfect / perfect continuous.',
        ),
        5 => mcq(
            'perfect-continuous', $level,
            'My hands are dirty because I ___ in the ' . pick(['garden', 'garage', 'kitchen', 'yard'], $i) . '.',
            'Tay tôi bẩn vì tôi đã làm việc ở ' . pick(['vườn', 'garage', 'bếp', 'sân'], $i) . '.',
            ['have been working', 'worked', 'work', 'was working'],
            0,
            'Bằng chứng hiện tại → present perfect continuous.',
        ),
        6 => mcq(
            'perfect-continuous', $level,
            'It ___ since ' . pick(['early morning', 'midnight', 'lunch', 'yesterday evening'], $i) . '.',
            'Trời mưa từ ' . pick(['sáng sớm', 'nửa đêm', 'buổi trưa', 'tối qua'], $i) . '.',
            ['has been raining', 'rained', 'is raining', 'rains'],
            0,
            'Since + present perfect (continuous) cho hành động kéo dài.',
        ),
        7 => mcq(
            'perfect-continuous', $level,
            'We ___ each other for ' . (2 + ($i % 9)) . ' years before we got married in ' . (2010 + ($i % 12)) . '.',
            'Chúng tôi quen nhau ' . (2 + ($i % 9)) . ' năm trước khi cưới năm ' . (2010 + ($i % 12)) . '.',
            ['had known', 'knew', 'have known', 'were knowing'],
            0,
            'Before + past simple → past perfect (state verbs).',
        ),
        8 => mcq(
            'perfect-continuous', $level,
            'She ___ her ' . pick(['keys', 'wallet', 'passport', 'ticket'], $i) . '; she can\'t get in.',
            'Cô ấy đã làm mất ' . pick(['chìa khóa', 'ví', 'hộ chiếu', 'vé'], $i) . '; không vào được.',
            ['has lost', 'lost', 'has been losing', 'was losing'],
            0,
            'Kết quả hiện tại → present perfect.',
        ),
        9 => mcq(
            'perfect-continuous', $level,
            'At noon tomorrow I ___ on a flight to ' . pick(['Singapore', 'Tokyo', 'Bangkok', 'Seoul'], $i) . '.',
            'Trưa mai tôi sẽ đang trên chuyến bay đi ' . pick(['Singapore', 'Tokyo', 'Bangkok', 'Seoul'], $i) . '.',
            ['will be sitting', 'will sit', 'sit', 'am sitting'],
            0,
            'Future continuous tại mốc tương lai.',
        ),
        10 => mcq(
            'perfect-continuous', $level,
            'I ___ ' . (2 + ($i % 8)) . ' emails so far today.',
            'Hôm nay tôi đã gửi ' . (2 + ($i % 8)) . ' email.',
            ['have sent', 'sent', 'have been sending', 'was sending'],
            0,
            'So far → present perfect.',
        ),
        default => mcq(
            'perfect-continuous', $level,
            'When I arrived, they ___ ' . pick(['football', 'basketball', 'volleyball', 'chess'], $i) . ' for ' . (1 + ($i % 5)) . ' hour(s).',
            'Khi tôi đến, họ đã ' . pick(['đá bóng', 'chơi bóng rổ', 'chơi bóng chuyền', 'chơi cờ'], $i) . ' được ' . (1 + ($i % 5)) . ' giờ.',
            ['had been playing', 'were playing', 'played', 'have played'],
            0,
            'Past perfect continuous trước mốc quá khứ.',
        ),
    };
}
