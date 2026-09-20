/* ============================================================
   Section: Practice — Cohen's kappa  (PRACTICE)
   Block 3 "Evaluation", section 4 (course section 17).
   Follows "LLM-as-judge", which introduces the judge, its biases,
   and kappa = (p_o - p_e)/(1 - p_e) with a live explorer. This
   section is the hand-computation set: pure HTML, a row of
   Toolkit.problem click-to-reveal items, no interactives.

   Arc of the nine problems:
     1-2  read the margins, then finish the computation (kappa .49)
     3    the constant judge -> kappa exactly 0 (general fact)
     4    the kappa paradox: 91 percent agreement, kappa .13
     5    two judges ranked BACKWARDS by raw agreement (.88 vs .80
          raw; .44 vs .48 kappa) - the problem that changes behavior
     6    negative kappa is systematic, not noise (-.60)
     7    scale invariance: double every cell, kappa unchanged
     8    three-level 0/1/2 rubric (kappa .57); more balanced classes
          shrink chance agreement; pointer to weighted kappa
     9    the human-human CEILING - conceptual, no arithmetic

   All arithmetic verified against exact fractions before writing.
   Numbers chosen so every margin lands on clean hundredths and the
   whole set is paper-and-pencil safe (exams are no-device).

   Facts: pure statistics; no external API facts.

   NOTE (playbook): KaTeX double-backslashed. No literal dollar
   signs outside the one display-math line. No raw angle brackets in
   the rendered HTML. Literal Unicode written directly. Instructor
   notes routed through Toolkit.instructorNote.
   ============================================================ */

(function () {

  // A 2x2 agreement matrix: diagonal green (agree), off-diagonal pink.
  // cells are given reading order: [r1c1, r1c2, r2c1, r2c2].
  function mat2(colHeads, rowHeads, cells) {
    return `<div class="ka-grid">
      <div class="cm-corner"></div>
      <div class="cm-chead">${colHeads[0]}</div>
      <div class="cm-chead">${colHeads[1]}</div>
      <div class="cm-rhead">${rowHeads[0]}</div>
      <div class="ka-cell agree">${cells[0]}</div>
      <div class="ka-cell dis">${cells[1]}</div>
      <div class="cm-rhead">${rowHeads[1]}</div>
      <div class="ka-cell dis">${cells[2]}</div>
      <div class="ka-cell agree">${cells[3]}</div>
    </div>`;
  }

  // A 3x3 agreement matrix. cells given as three rows of three.
  function mat3(colHeads, rowHeads, rows) {
    const cell = (v, isDiag) =>
      `<div class="ka-cell ${isDiag ? "agree" : "dis"}">${v}</div>`;
    let out = `<div class="ka-grid k3">
      <div class="cm-corner"></div>
      ${colHeads.map((h) => `<div class="cm-chead">${h}</div>`).join("")}`;
    rows.forEach((row, r) => {
      out += `<div class="cm-rhead">${rowHeads[r]}</div>`;
      row.forEach((v, c) => { out += cell(v, r === c); });
    });
    return out + `</div>`;
  }

  Toolkit.resetProblems();

  window.SectionContent["kappa-practice"] = {
    title: "Practice: Cohen's kappa",

    html: `
    <div class="eyebrow">Evaluation · Section 17 · Practice</div>
    <h1>Practice: Cohen's kappa</h1>

    <p>Kappa is the number that decides whether you are allowed to trust a judge, so
    it is worth being able to compute by hand — not because you will (scikit-learn
    has it), but because the arithmetic is where the intuition lives. Work these with
    paper and a pencil. Every matrix below is built so the margins land on clean
    hundredths.</p>

    ${Toolkit.callout(
      `<p class="mathline">$$\\kappa = \\frac{p_o - p_e}{1 - p_e}$$</p>
       <p>The whole procedure, every time:</p>
       <ol>
         <li><strong>Margins.</strong> Total each row (the human's habits) and each
           column (the judge's habits).</li>
         <li><strong>p<sub>o</sub></strong> — add the diagonal, divide by N.</li>
         <li><strong>p<sub>e</sub></strong> — for each category, multiply its row
           share by its column share; add those products.</li>
         <li><strong>kappa</strong> — (p<sub>o</sub> − p<sub>e</sub>) divided by
           (1 − p<sub>e</sub>).</li>
       </ol>
       <p>Read the answer as: <em>of the agreement that was still available above
       chance, what fraction did the judge actually earn?</em></p>
       <p>And the conventional vocabulary for the result (Landis &amp; Koch, 1977):</p>
       <div class="kappa-bands">
         <div class="kb-item"><span class="kb-chip poor">&lt; 0.20</span> slight</div>
         <div class="kb-item"><span class="kb-chip fair">0.21–0.40</span> fair</div>
         <div class="kb-item"><span class="kb-chip mod">0.41–0.60</span> moderate</div>
         <div class="kb-item"><span class="kb-chip sub">0.61–0.80</span> substantial</div>
         <div class="kb-item"><span class="kb-chip perf">0.81–1.0</span> almost perfect</div>
       </div>
       <p>Those bands are a <strong>convention, not a law</strong> — they were asserted
       in a paper, not derived from anything. They are useful shared vocabulary and a
       bad passing grade: what counts as good enough depends on what a wrong grade
       costs you downstream, and on a benchmark that is not 1.0. Problem 9 is about
       that benchmark.</p>`,
      { type: "note", label: "The recipe" }
    )}

    ${Toolkit.problem(
      `<p>One hundred student summaries. A human and your judge each label every one
       PASS or FAIL:</p>
       ${mat2(
         ["judge: PASS", "judge: FAIL"],
         ["human: PASS", "human: FAIL"],
         [45, 15, 10, 30]
       )}
       <p>Write down both row totals and both column totals, then compute the
       observed agreement p<sub>o</sub>.</p>`,
      `<p><strong>Row totals</strong> (the human): PASS 45 + 15 = <strong>60</strong>,
       FAIL 10 + 30 = <strong>40</strong>.<br>
       <strong>Column totals</strong> (the judge): PASS 45 + 10 = <strong>55</strong>,
       FAIL 15 + 30 = <strong>45</strong>.</p>
       <p><strong>p<sub>o</sub> = (45 + 30) / 100 = 0.75.</strong> They agree on three
       out of four summaries.</p>
       <p>Notice the margins are not the same: the human passes 60% of the time, the
       judge 55%. Those two habits are the only thing chance agreement is built from —
       so hold on to them.</p>`,
      { label: "Problem 1 · Read the margins" }
    )}

    ${Toolkit.problem(
      `<p>Same matrix. Compute the chance agreement p<sub>e</sub>, then kappa. What
       does the number mean in words?</p>`,
      `<p>Imagine both raters kept their habits but stopped looking at the summaries —
       each just flips their own weighted coin. How often do they land on the same
       answer?</p>
       <p>both say PASS: 0.60 × 0.55 = 0.33<br>
          both say FAIL: 0.40 × 0.45 = 0.18<br>
          <strong>p<sub>e</sub> = 0.33 + 0.18 = 0.51</strong></p>
       <p>So 51 of those 75 agreement points were free. Then</p>
       <p><strong>kappa = (0.75 − 0.51) / (1 − 0.51) = 0.24 / 0.49 ≈ 0.49.</strong></p>
       <p>In words: chance already handed out 0.51, leaving only 0.49 of agreement
       available to earn, and the judge earned 0.24 of it — <strong>about half the
       available headroom</strong>. On the Landis–Koch bands that is &ldquo;moderate,&rdquo;
       which for most tasks means the judge is promising but not yet trustworthy at
       scale.</p>`,
      { label: "Problem 2 · Finish the computation" }
    )}

    ${Toolkit.problem(
      `<p>A judge is misconfigured and returns PASS for every single output:</p>
       ${mat2(
         ["judge: PASS", "judge: FAIL"],
         ["human: PASS", "human: FAIL"],
         [60, 0, 40, 0]
       )}
       <p>Compute p<sub>o</sub>, p<sub>e</sub>, and kappa. Then prove the general
       case: show that <em>any</em> judge giving the same label to everything scores
       kappa = 0, whatever the human's labels are.</p>`,
      `<p>p<sub>o</sub> = (60 + 0) / 100 = <strong>0.60</strong> — a 60% agreement
       rate from a judge that is not reading anything.</p>
       <p>The judge's column shares are 1.00 and 0.00, so<br>
          p<sub>e</sub> = (0.60)(1.00) + (0.40)(0.00) = <strong>0.60</strong>.</p>
       <p><strong>kappa = (0.60 − 0.60) / (1 − 0.60) = 0 / 0.40 = 0.</strong> Every
       point of that 60% was free.</p>
       <p><strong>The general case.</strong> Let the human label a fraction <em>r</em>
       of items PASS, and let the judge say PASS to everything. The judge's column
       shares are 1 and 0. Agreement happens exactly on the human's PASS items, so
       p<sub>o</sub> = r. And p<sub>e</sub> = r(1) + (1 − r)(0) = r as well. The
       numerator r − r is zero, so kappa = 0 for every value of r.</p>
       <p>This is the same degenerate classifier that makes raw accuracy lie — the
       imbalance trap wearing a new hat. Kappa is built precisely so this judge scores
       zero.</p>`,
      { label: "Problem 3 · The judge that always says PASS" }
    )}

    ${Toolkit.problem(
      `<p>A real judge, on a task where student work is usually fine — 95 of the 100
       outputs are genuinely good:</p>
       ${mat2(
         ["judge: PASS", "judge: FAIL"],
         ["human: PASS", "human: FAIL"],
         [90, 5, 4, 1]
       )}
       <p>Compute p<sub>o</sub> and kappa. Your teammate looks at the agreement rate
       and says &ldquo;ship it.&rdquo; Are they right?</p>`,
      `<p>p<sub>o</sub> = (90 + 1) / 100 = <strong>0.91</strong>. Ninety-one percent
       agreement — this is exactly the number your teammate is looking at.</p>
       <p>Margins: the human passes 95%, the judge passes 94%.<br>
          p<sub>e</sub> = (0.95)(0.94) + (0.05)(0.06) = 0.893 + 0.003 =
          <strong>0.896</strong>.</p>
       <p><strong>kappa = (0.910 − 0.896) / (1 − 0.896) = 0.014 / 0.104 ≈ 0.13.</strong></p>
       <p><strong>No — do not ship it.</strong> Look at what the judge actually did
       with the cases you care about: there were 5 bad outputs and it caught
       <em>one</em>. All that agreement was purchased by the base rate. When 95% of
       everything passes, saying PASS is nearly free, and kappa charges the judge for
       exactly that.</p>
       <p>This gap between high agreement and low kappa is common enough to have a
       name — the <strong>kappa paradox</strong> — and it is the single best reason to
       never report judge quality as a percentage.</p>`,
      { label: "Problem 4 · Ninety-one percent and still broken" }
    )}

    ${Toolkit.problem(
      `<p>You are choosing between two candidate judges. Both grade the same 100
       outputs, against the same human labels (85 good, 15 bad).</p>
       <p><strong>Judge A</strong> — agrees with the human on 88 of 100:</p>
       ${mat2(
         ["A: good", "A: bad"],
         ["human: good", "human: bad"],
         [82, 3, 9, 6]
       )}
       <p><strong>Judge B</strong> — agrees on only 80 of 100:</p>
       ${mat2(
         ["B: good", "B: bad"],
         ["human: good", "human: bad"],
         [66, 19, 1, 14]
       )}
       <p>Raw agreement prefers A by eight points. Compute kappa for each. Which judge
       do you deploy?</p>`,
      `<p><strong>Judge A.</strong> Columns: 82 + 9 = 91 good, 3 + 6 = 9 bad.<br>
         p<sub>o</sub> = (82 + 6) / 100 = 0.88<br>
         p<sub>e</sub> = (0.85)(0.91) + (0.15)(0.09) = 0.7735 + 0.0135 = 0.787<br>
         <strong>kappa = 0.093 / 0.213 ≈ 0.44</strong></p>
       <p><strong>Judge B.</strong> Columns: 66 + 1 = 67 good, 19 + 14 = 33 bad.<br>
         p<sub>o</sub> = (66 + 14) / 100 = 0.80<br>
         p<sub>e</sub> = (0.85)(0.67) + (0.15)(0.33) = 0.5695 + 0.0495 = 0.619<br>
         <strong>kappa = 0.181 / 0.381 ≈ 0.48</strong></p>
       <p><strong>Raw agreement ranked them backwards.</strong> B agrees less often
       and is the better judge. The reason is in the bottom row: there are 15 bad
       outputs, and B finds 14 of them while A finds 6. A is riding the base rate; B
       is actually detecting failure, which is the entire job of a judge.</p>
       <p>One honest caveat worth saying out loud: B is also trigger-happy, flagging
       19 good outputs as bad. Kappa tells you B extracts more signal; it does not
       tell you those two error types cost the same. That is a precision-and-recall
       question, and you answer it by knowing what a wrong grade costs you
       downstream. Kappa narrows the field — it does not make the decision.</p>`,
      { label: "Problem 5 · Two judges, and raw agreement lies" }
    )}

    ${Toolkit.problem(
      `<p>A judge you just wired up produces this:</p>
       ${mat2(
         ["judge: PASS", "judge: FAIL"],
         ["human: PASS", "human: FAIL"],
         [10, 40, 40, 10]
       )}
       <p>Compute kappa. What does a negative value mean — and is this judge
       worthless?</p>`,
      `<p>p<sub>o</sub> = (10 + 10) / 100 = 0.20. Margins are 50/50 both ways, so<br>
         p<sub>e</sub> = (0.5)(0.5) + (0.5)(0.5) = 0.50.</p>
       <p><strong>kappa = (0.20 − 0.50) / 0.50 = −0.60.</strong> Worse than chance;
       kappa's floor is −1.</p>
       <p><strong>Not worthless — broken.</strong> A judge that knows nothing lands
       near 0, not at −0.6. Being reliably wrong takes just as much information as
       being reliably right: this judge agrees with the human only 20% of the time,
       which means flipping its answers would agree 80% of the time. The information
       is there and the wiring is backwards.</p>
       <p>So treat a strongly negative kappa as a bug report, not a quality score. The
       usual culprits: the label mapping is inverted somewhere in your harness, the
       rubric's 0 and 2 anchors got swapped in the prompt, or you compared two columns
       that are not the same items. Go find it — do not patch it by flipping the
       output, because you will not know which of those three it was.</p>`,
      { label: "Problem 6 · Below zero" }
    )}

    ${Toolkit.problem(
      `<p>You rerun the Problem 1 eval on twice as much data and get exactly the same
       shape — every cell doubled: 90, 30, 20, 60, for 200 items.</p>
       <p>Without recomputing from scratch, predict the new kappa. Then say what
       <em>did</em> improve by doubling the data.</p>`,
      `<p><strong>Kappa is unchanged: 0.49.</strong> Both p<sub>o</sub> and
       p<sub>e</sub> are built entirely from proportions — a diagonal share and a set
       of row-share × column-share products. Multiply every cell by a constant
       <em>c</em> and every one of those shares is c·x / c·N = x/N. Nothing moves.</p>
       <p>What improved is not the estimate but your <strong>confidence</strong> in
       it. Kappa computed on 200 items and kappa computed on 100 items can be the same
       number while carrying very different uncertainty — the 200-item version would
       survive a resample much more reliably. Kappa measures agreement; it says
       nothing about how sure you are of the measurement, and a kappa reported without
       some sense of its error bar is only half a result.</p>
       <p>This is worth internalizing because it cuts the other way too: a kappa of
       0.62 computed on 12 hand-labeled items is not evidence of a substantial judge.
       It is evidence that you need more labels.</p>`,
      { label: "Problem 7 · Does more data move kappa?" }
    )}

    ${Toolkit.problem(
      `<p>Now an anchored three-level rubric — the 0/1/2 kind you would actually write
       for a judge. One hundred outputs, scored by a human and by the judge:</p>
       ${mat3(
         ["judge: 0", "judge: 1", "judge: 2"],
         ["human: 0", "human: 1", "human: 2"],
         [[18, 6, 1], [5, 28, 7], [1, 8, 26]]
       )}
       <p>Compute p<sub>o</sub>, p<sub>e</sub>, and kappa. Then compare the size of
       the kappa correction here to the one in Problem 4, and explain the
       difference.</p>`,
      `<p>Nothing about the procedure changes — the diagonal is just longer.</p>
       <p><strong>p<sub>o</sub></strong> = (18 + 28 + 26) / 100 =
       <strong>0.72</strong>.</p>
       <p>Row totals (human): 25, 40, 35. Column totals (judge): 24, 42, 34. So</p>
       <p>p<sub>e</sub> = (0.25)(0.24) + (0.40)(0.42) + (0.35)(0.34)<br>
          &nbsp;&nbsp;&nbsp;&nbsp;= 0.060 + 0.168 + 0.119 = <strong>0.347</strong></p>
       <p><strong>kappa = (0.720 − 0.347) / (1 − 0.347) = 0.373 / 0.653 ≈ 0.57.</strong></p>
       <p><strong>Why the correction is so much gentler here.</strong> In Problem 4,
       chance agreement was 0.896 and kappa demolished the raw number. Here chance
       agreement is only 0.347, and kappa (0.57) sits much closer to raw agreement
       (0.72). Two things drove p<sub>e</sub> down: there are three categories instead
       of two, and both raters spread their labels fairly evenly across them. Free
       agreement comes from raters piling onto the same category — the more evenly the
       labels are spread, the less luck can buy.</p>
       <p>One more thing this matrix is telling you, which kappa alone will not.
       Almost every error is between <em>adjacent</em> levels; only two items (the
       corner cells) jump the full distance from 0 to 2. For an ordered rubric like
       this, that distinction matters — a 1 graded as a 2 is a far smaller problem
       than a 0 graded as a 2 — and plain kappa treats both as simply
       &ldquo;wrong.&rdquo; When the scale is ordered and the gap between levels has
       meaning, there is a variant, <strong>weighted kappa</strong>, that charges
       larger penalties for more distant disagreements. Reach for it when your levels
       are ordered; plain kappa is right when your categories are just different
       (topic labels, intent classes) rather than ranked.</p>`,
      { label: "Problem 8 · A three-level rubric" }
    )}

    ${Toolkit.problem(
      `<p>No arithmetic on this one. You have two trained human graders label the same
       60 outputs against your rubric. They reach a kappa of <strong>0.62</strong>
       with each other.</p>
       <p>You then run your judge on those same outputs, and it reaches
       <strong>0.61</strong> against grader 1.</p>
       <p>Your teammate says: &ldquo;0.61 is only just into the substantial band, so
       the judge needs more work.&rdquo; Do you agree? What should you actually do
       next?</p>`,
      `<p><strong>Your teammate is reading the number against the wrong benchmark.</strong>
       The judge is at 0.61 where two trained humans manage 0.62 — it is essentially
       <em>at the ceiling</em>. Nobody should expect a judge to agree with a human
       more than another careful human does; if it did, you would suspect the two were
       agreeing on something other than the task. Measuring human-human agreement
       first is what turns kappa from a floating number into a number with a target,
       and it is a step people routinely skip.</p>
       <p><strong>The real finding is about the rubric, not the judge.</strong> Two
       trained graders landing at 0.62 means the rubric is not yet a decision
       procedure — roughly a third of the earnable agreement is being lost to honest
       differences in reading it. That ambiguity is the binding constraint on the
       whole eval, and no amount of prompt tuning on the judge will get you past
       it.</p>
       <p>So: go back to the rubric. Find the items the two graders split on and read
       them together — that disagreement set is a precise map of where your anchors
       are vague. Tighten each level into a condition a grader could check without
       judgment, re-measure human-human agreement, and only then re-measure the judge.
       The ceiling rises first; the judge follows it.</p>`,
      { label: "Problem 9 · What is a good kappa, anyway?" }
    )}

    ${Toolkit.instructorNote(
      `A suggested path if you are short on time: <strong>1 and 2</strong> on the
       board together (they are one computation split in half, and splitting it forces
       the margins to get written down, which is where students go wrong).
       <strong>3 and 4</strong> are the pair that actually sells kappa — run them
       back to back, since 3 gives the clean zero and 4 gives the uncomfortable case
       where a number you would have shipped collapses. <strong>5</strong> is the one
       that changes behavior, because it is the first time raw agreement and kappa
       give opposite recommendations; if only one problem survives the class period,
       make it that one. <strong>8</strong> is the most exam-shaped. <strong>9</strong>
       works well as discussion with no pencils out at all.`
    )}

    ${Toolkit.instructorNote(
      `Three errors to watch for while circulating, all in the p<sub>e</sub> step.
       (1) Building chance agreement out of the <em>diagonal</em> rather than the
       margins — students see two numbers to multiply and grab the wrong two.
       (2) Multiplying row × row (or column × column) instead of row × column; the
       fix is to keep saying &ldquo;one habit from each rater.&rdquo;
       (3) Forgetting the second product entirely and using only the
       both-say-yes term, which inflates kappa. A cheap check students can run
       themselves: the row shares must sum to 1 and so must the column shares, and
       p<sub>e</sub> must come out between 0 and 1 and usually well above 0.
       <br><br>
       For an exam item, the shape that tests understanding rather than arithmetic is:
       give a 2×2 or 3×3 matrix, ask for the margins, p<sub>o</sub>, p<sub>e</sub> and
       kappa, then add <em>one sentence on why kappa and raw agreement disagree here</em>.
       That last sentence is the whole lesson and it cannot be computed. Problem 4's
       matrix is the best source of a fresh version — move the base rate and the same
       question regenerates with new numbers.`
    )}
  `,
  };
})();
