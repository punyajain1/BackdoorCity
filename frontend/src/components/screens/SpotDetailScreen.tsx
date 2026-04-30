import { useState } from "react";
import { PageLayout, PageHeader, Breadcrumb, Divider, Chip, SectionLabel } from "@/components/ui/Shared";

interface Props {
  city: any;
  category: any;
  spot: any;
  onBack: () => void;
}

export default function SpotDetailScreen({ city, category, spot, onBack }: Props) {
  const [votes, setVotes] = useState(spot.votes || 0);
  const [voted, setVoted] = useState(false);
  const [reviews, setReviews] = useState(spot.reviews || []);
  const [newReview, setNewReview] = useState("");
  const [handle, setHandle] = useState("");

  const isVerified = spot.verified || votes >= 10;

  const handleVote = () => {
    if (voted) {
      setVotes((v: number) => Math.max(0, v - 1));
      setVoted(false);
    } else {
      setVotes((v: number) => v + 1);
      setVoted(true);
    }
  };

  const handlePostReview = () => {
    if (!newReview.trim()) return;
    const rev = {
      submitterHandle: handle.trim() ? (handle.startsWith('@') ? handle : `@${handle}`) : '@anonymous',
      verified: false, // You generally don't set this blindly without checking the user, but for demo:
      createdAt: new Date().toISOString(),
      text: newReview.trim()
    };
    setReviews([rev, ...reviews]);
    setNewReview("");
    setHandle("");
  };

  return (
    <PageLayout>
      <Breadcrumb items={[
        { label: "where to?", onClick: () => { } },
        { label: city?.name.toLowerCase() },
        { label: category?.name.toLowerCase(), onClick: onBack },
        { label: spot?.name }
      ]} />

      <PageHeader icon={category?.icon} title={spot?.name} />
      <Divider />

      <table className="w-full border-collapse mb-5">
        <tbody>
          <tr>
            <td className="text-[13px] text-[#71717a] w-[130px] pr-3 py-1 align-top">Neighbourhood</td>
            <td className="text-[13px] text-[white] py-1">{spot.area}</td>
          </tr>
          <tr>
            <td className="text-[13px] text-[#71717a] w-[130px] pr-3 py-1 align-top">Best time</td>
            <td className="text-[13px] text-[white] py-1">{spot.time || "Anytime"}</td>
          </tr>
          <tr>
            <td className="text-[13px] text-[#71717a] w-[130px] pr-3 py-1 align-top">Spend</td>
            <td className="text-[13px] text-[white] py-1">{spot.price || "Variable"}</td>
          </tr>
          <tr>
            <td className="text-[13px] text-[#71717a] w-[130px] pr-3 py-1 align-top">Category</td>
            <td className="text-[13px] text-[white] py-1">{category?.name}</td>
          </tr>
          <tr>
            <td className="text-[13px] text-[#71717a] w-[130px] pr-3 py-1 align-top">Status</td>
            <td className="text-[13px] text-[white] py-1">
              {isVerified ? '✓ Community verified' : `Unverified · ${votes}/10 upvotes needed`}
            </td>
          </tr>
          {spot.locationUrl && (
            <tr>
              <td className="text-[13px] text-[#71717a] w-[130px] pr-3 py-1 align-top">Map</td>
              <td className="text-[13px] text-[white] py-1">
                <a href={spot.locationUrl} target="_blank" rel="noreferrer" className="underline hover:text-[#a1a1aa]">View location</a>
              </td>
            </tr>
          )}
          <tr>
            <td className="text-[13px] text-[#71717a] w-[130px] pr-3 py-1 align-top">Added by</td>
            <td className="text-[13px] text-[white] py-1">{spot.submitterHandle || spot.handle || "@anonymous"}</td>
          </tr>
        </tbody>
      </table>

      {spot.tags && spot.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {spot.tags.map((tag: string) => <Chip key={tag}>{tag}</Chip>)}
        </div>
      )}

      <Divider />

      <div className="text-[15px] text-[#a1a1aa] leading-relaxed mb-7 pb-4 border-b border-[#2a2a2a]">
        {spot.description || spot.desc}
      </div>

      <div className="flex items-center gap-2 mt-6">
        <button
          onClick={handleVote}
          className={`text-[13px] px-3.5 py-1.5 rounded-[6px] border border-[#52525b] transition-colors font-sans ${voted ? 'bg-[#1a1a1a] text-[white]' : 'bg-[#0a0a0a] text-[white] hover:bg-[#1a1a1a]'
            }`}
        >
          ▲ Upvote · {votes}
        </button>
        <button className="text-[13px] px-3.5 py-1.5 rounded-[6px] border border-[#52525b] bg-[#0a0a0a] text-[white] hover:bg-[#1a1a1a] transition-colors font-sans">
          ☆ Save
        </button>
      </div>

      <div className="mt-7 pt-4">
        <SectionLabel>Reviews ({reviews.length})</SectionLabel>

        <div className="space-y-4 mb-6">
          {reviews.map((r: any, i: number) => {
            const h = r.submitterHandle || r.h;
            const text = r.text || r.t;
            const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : r.d;
            const verified = r.verified || r.v;

            return (
              <div key={r.id || i} className="mb-4">
                <div className="text-[13px] text-[#71717a] mb-1 flex items-center gap-2">
                  <span className="text-[#a1a1aa] font-medium">{h}</span>
                  {verified && <Chip size="sm" verified>verified</Chip>}
                  <span className="ml-auto">{date}</span>
                </div>
                <div className="text-[14px] text-[white] leading-relaxed">{text}</div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 border-t border-[#2a2a2a] pt-6">
          <SectionLabel>Leave a note</SectionLabel>
          <textarea
            value={newReview}
            onChange={e => setNewReview(e.target.value)}
            className="w-full border border-[#2a2a2a] rounded-[6px] p-2.5 text-[14px] bg-[#0a0a0a] resize-none min-h-[80px] outline-none focus:border-[#52525b] font-sans"
            placeholder="What made it worth going?"
          />
          <div className="flex items-center justify-between mt-2.5 gap-2">
            <input
              value={handle}
              onChange={e => setHandle(e.target.value)}
              className="border border-[#2a2a2a] rounded-[6px] py-1.5 px-3 text-[13px] bg-[#0a0a0a] outline-none focus:border-[#52525b] font-sans w-[200px]"
              placeholder="your @handle (optional)"
            />
            <button
              onClick={handlePostReview}
              className="text-[13px] px-3.5 py-1.5 rounded-[6px] bg-[white] text-white hover:opacity-85 transition-opacity font-sans"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}