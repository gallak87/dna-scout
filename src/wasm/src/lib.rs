use wasm_bindgen::prelude::*;

/// Compute a dot plot matrix for two DNA sequences.
///
/// For each position (i, j), a dot is placed if at least `threshold` out of
/// `window` consecutive bases match between seq_a[i..] and seq_b[j..].
///
/// Returns a flat row-major Uint8Array of length len_a * len_b.
/// Value 255 = match, 0 = no match.
#[wasm_bindgen]
pub fn compute_dotplot(
    seq_a: &str,
    seq_b: &str,
    window: usize,
    threshold: usize,
) -> Vec<u8> {
    let a: &[u8] = seq_a.as_bytes();
    let b: &[u8] = seq_b.as_bytes();
    let len_a = a.len();
    let len_b = b.len();

    let mut out = vec![0u8; len_a * len_b];

    if window == 0 || len_a == 0 || len_b == 0 {
        return out;
    }

    for i in 0..len_a {
        for j in 0..len_b {
            let avail = (len_a - i).min(len_b - j).min(window);
            if avail < threshold {
                continue;
            }
            let matches = a[i..i + avail]
                .iter()
                .zip(&b[j..j + avail])
                .filter(|(x, y)| x == y)
                .count();
            if matches >= threshold {
                out[i * len_b + j] = 255;
            }
        }
    }

    out
}
