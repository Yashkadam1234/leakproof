```markdown
# METRICS.md

## What We Should Actually Measure

The temptation with any new product is to 
reach for pageviews, DAU, or session length. 
For this product those numbers are noise.

This is not Slack. People do not open an 
AI spend audit every morning. A healthy 
user might run one audit per quarter — 
when budgets get reviewed or finance 
starts asking questions.

So the North Star has to reflect what 
this product actually is: a B2B lead 
generation tool for Credex.

**North Star: Qualified leads generated**

Definition: audit completed AND email captured.

An audit without contact info is curiosity. 
An audit plus email is intent. That distinction 
matters more than any traffic number.

---

## The 3 Input Metrics That Drive the North Star

**1. Audit completion rate**

Formula: form submitted / landing page visits

Target: above 40%

If people land and abandon the form the 
issue is almost always one of three things — 
weak positioning, too much friction, or 
unclear payoff before they commit. For a 
2-minute audit anything below 40% means 
the onboarding experience needs work before 
spending anything on distribution.

**2. Email capture rate post-audit**

Formula: emails captured / audits completed

Target: above 25%

This is the conversion point I care most 
about. By the time someone sees the results 
page they have already gotten value — savings 
numbers, recommendations, an AI summary. 
If they still will not hand over an email 
the perceived value of saving the report 
is too low. One in four should convert. 
Below that the results page needs work, 
not the acquisition channel.

**3. Share link click-through rate**

Formula: share link clicks / audits completed

This one is harder to target because I do 
not have a good benchmark. But it matters 
because it measures whether users think 
the output is worth showing someone else.

If engineering managers are forwarding 
audit URLs internally — "we are wasting 
$400 a month on this" — distribution 
starts compounding without any additional 
spend. That is the viral loop the shareable 
URL is designed to create. If nobody is 
clicking share the loop is broken and 
the results page needs to feel more 
worth sharing.

---

## What to Instrument First

PostHog or Mixpanel. These events on day one:

```
form_started
tool_added
audit_generated
email_captured
share_clicked
credex_cta_clicked
```

That covers the full funnel without 
overcomplicating things early. Add 
more granularity once the basics 
are working.

---

## The Pivot Trigger

If email capture rate falls below 15% 
after the first 500 audits — stop 
pushing distribution and fix the 
results page first.

More traffic into a broken conversion 
funnel is just wasted spend. At that 
point the question is not "how do we 
get more users" — it is "why are 
people running the audit and then 
not caring enough about the output 
to save it."

That answer changes everything about 
what to build next.
```