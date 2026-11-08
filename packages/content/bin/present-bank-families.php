<?php

/**
 * Present-tense question families (included by generate-quiz-bank.php).
 *
 * @return array<string, mixed>
 */
function buildPresentFromFamily(int $n, string $level, string $kind, array $subjects, array $verbs): array
{
    $family = intdiv($n, 25);
    $s = pick($subjects, $n);
    $v = pick($verbs, $n * 5 + 3);
    $third = in_array($s, ['He', 'She', 'Tom', 'Anna'], true);
    $sv = subjectVi($s);
    $objVi = objectPhraseVi($v);
    $citiesEn = ['Hanoi', 'Da Nang', 'Hue', 'Saigon', 'London', 'Tokyo', 'Paris', 'Sydney', 'Seoul', 'Bangkok'];
    $citiesVi = ['Hà Nội', 'Đà Nẵng', 'Huế', 'Sài Gòn', 'London', 'Tokyo', 'Paris', 'Sydney', 'Seoul', 'Bangkok'];
    $cityEn = pick($citiesEn, $n * 2 + 1);
    $cityVi = pick($citiesVi, $n * 2 + 1);
    $year = 2005 + ($n % 20);
    $hours = 1 + ($n % 12);

    if ($kind === 'fill_blank') {
        return match ($family % 5) {
            0 => fill('present', $level, "We have ___ ({$v['w']}) in {$cityEn} since {$year}.", "Chúng tôi đã {$v['vn']} ở {$cityVi} từ năm {$year}.", $v['ed'], 'Present perfect: have/has + V3; since + mốc thời gian.'),
            1 => fill('present', $level, "She has been ___ ({$v['w']}) in {$cityEn} for {$hours} hours.", "Cô ấy đã {$v['vn']} ở {$cityVi} được {$hours} giờ.", $v['ing'], 'Present perfect continuous: has been + V-ing + for/since.'),
            2 => fill('present', $level, "I ___ (not / {$v['w']}) in {$cityEn} on Sundays.", "Tôi không {$v['vn']} ở {$cityVi} vào Chủ nhật.", "don't {$v['w']}", 'Present simple phủ định: don\'t/doesn\'t + V nguyên mẫu.'),
            3 => fill('present', $level, "___ you ever ___ ({$v['w']}) in {$cityEn}?", "Bạn đã từng {$v['vn']} ở {$cityVi} chưa?", 'Have ... ' . $v['ed'], 'Present perfect hỏi kinh nghiệm: Have you ever + V3?', ['have ' . $v['ed']]),
            default => fill('present', $level, "They have ___ ({$v['w']}) there {$hours} times this month.", "Tháng này họ đã {$v['vn']} ở đó {$hours} lần.", $v['ed'], 'Present perfect: have/has + V3 (kinh nghiệm trong kỳ).'),
        };
    }

    return match ($family % 10) {
        0 => mcq('present', $level, "{$s} ___ {$v['at']} in {$cityEn} " . habitEn($n) . '.', "{$sv} ___ {$objVi} ở {$cityVi} " . habitVi($n) . '.', $third ? [$v['ws'], $v['w'], $v['ing'], $v['ed']] : [$v['w'], $v['ws'], $v['ing'], $v['ed']], $third ? 0 : 0, 'Thói quen / tần suất → present simple.'),
        1 => mcq('present', $level, "Listen! {$s} ___ {$v['at']} in {$cityEn} " . nowEn($n) . '.', "Nghe kìa! {$sv} đang ___ {$objVi} ở {$cityVi} " . nowVi($n) . '.', $third ? ["is {$v['ing']}", $v['ws'], $v['ed'], "has {$v['ed']}"] : ["are {$v['ing']}", $v['w'], $v['ed'], 'will ' . $v['w']], 0, 'Dấu hiệu đang diễn ra → present continuous.'),
        2 => mcq('present', $level, "{$s} ___ never ___ to {$cityEn} before.", "{$sv} chưa từng đến {$cityVi} trước đây.", $third ? ['has', 'have', 'had', 'is'] : ['have', 'has', 'had', 'are'], $third ? 0 : 0, 'Present perfect + never: have/has + V3.'),
        3 => mcq('present', $level, "How long ___ you ___ ({$v['w']}) in {$cityEn}?", "Bạn đã {$v['vn']} ở {$cityVi} bao lâu rồi?", ['have ... been ' . $v['ing'], 'are ... ' . $v['ing'], 'did ... ' . $v['w'], 'will ... ' . $v['w']], 0, 'How long + present perfect (continuous).'),
        4 => (function () use ($level, $n) {
            $fact = generalTruthFact($n);

            return mcq('present', $level, $fact['en'], $fact['vi'], $fact['options'], $fact['correct'], $fact['explain']);
        })(),
        5 => mcq('present', $level, "{$s} ___ ({$v['w']}) in {$cityEn} while I was cooking.", "{$sv} vừa {$v['vn']} xong ở {$cityVi} trong lúc tôi đang nấu.", ['has ' . $v['ed'], $v['ws'], 'is ' . $v['ing'], $v['ed']], 0, 'Hành động vừa xong → present perfect.'),
        6 => mcq('present', $level, "{$s} ___ {$v['at']} at " . (7 + ($n % 10)) . ' a.m. in ' . $cityEn . ' ' . habitEn($n + 1) . '.', "{$sv} ___ {$objVi} lúc " . (7 + ($n % 10)) . " giờ sáng ở {$cityVi} " . habitVi($n + 1) . '.', [$v['w'], $v['ws'], $v['ing'], $v['ed']], 0, 'Lịch cố định → present simple.'),
        7 => mcq('present', $level, "Does {$s} ___ {$v['at']} in {$cityEn} on weekends?", "Cuối tuần {$sv} có {$v['vn']} {$objVi} ở {$cityVi} không?", [$v['w'], $v['ws'], $v['ing'], $v['ed']], 0, 'Does + S + V (present simple hỏi).'),
        8 => mcq('present', $level, "{$s} ___ here in {$cityEn} for " . (1 + ($n % 15)) . ' years.', "{$sv} sống ở {$cityVi} được " . (1 + ($n % 15)) . ' năm rồi.', $third ? ['has lived', 'lives', 'is living', 'lived'] : ['have lived', 'live', 'are living', 'lived'], $third ? 0 : 0, 'For + khoảng thời gian → present perfect.'),
        default => mcq('present', $level, "{$s} always ___ late for " . pick(['class', 'work', 'meetings', 'the bus'], $n) . " in {$cityEn}.", "{$sv} luôn đến muộn " . pick(['giờ học', 'làm', 'họp', 'xe buýt'], $n) . " ở {$cityVi}.", $third ? ['arrives', 'arrive', 'is arriving', 'arrived'] : ['arrive', 'arrives', 'are arriving', 'arrived'], $third ? 0 : 0, 'Always + thói quen → present simple.'),
    };
}
