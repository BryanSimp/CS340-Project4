let dictionary = [];

// Load dictionary.txt when page starts
async function loadDictionary() {
  const response = await fetch("dictionary.txt");
  const text = await response.text();
  dictionary = text.split(/\r?\n/).filter(word => word.length > 0);
}

// Utility: check if a character is a vowel
function isVowel(ch) {
  return "aeiou".includes(ch.toLowerCase());
}

// Penalty rules
function penalty(a, b) {
  if (a === b) return 0;
  if (isVowel(a) && isVowel(b)) return 1;
  if (!isVowel(a) && !isVowel(b)) return 1;
  return 3; // vowel/consonant mismatch
}

// Sequence alignment algorithm (O(nm))
function sequenceAlignment(word1, word2) {
  const n = word1.length, m = word2.length;
  const dp = Array.from({length: n+1}, () => Array(m+1).fill(0));

  // Initialize gap penalties
  for (let i=0; i<=n; i++) dp[i][0] = i*2;
  for (let j=0; j<=m; j++) dp[0][j] = j*2;

  // Fill DP table
  for (let i=1; i<=n; i++) {
    for (let j=1; j<=m; j++) {
      dp[i][j] = Math.min(
        dp[i-1][j-1] + penalty(word1[i-1], word2[j-1]), // match/mismatch
        dp[i-1][j] + 2, // gap in word2
        dp[i][j-1] + 2  // gap in word1
      );
    }
  }
  return dp[n][m];
}

// Get top 10 suggestions
async function getSuggestions() {
  const input = document.getElementById("wordInput").value.trim();
  if (!input) return;

  if (!dictionary.length) {
    await loadDictionary();
  }

  const scores = dictionary.map(word => ({
    word,
    score: sequenceAlignment(input, word)
  }));

  scores.sort((a, b) => a.score - b.score);
  const top10 = scores.slice(0, 10);

  const list = document.getElementById("suggestions");
  list.innerHTML = "";
  top10.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.word} (score: ${s.score})`;
    list.appendChild(li);
  });
}

// Load dictionary on page load
window.onload = loadDictionary;
