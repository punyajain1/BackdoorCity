import { useState, useEffect } from "react";
import { PageLayout, PageHeader, Breadcrumb, Chip } from "@/components/ui/Shared";
import { API_URL } from "@/lib/api";

interface Props {
  onBack: () => void;
}

export default function AddSpotScreen({ onBack }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [handle, setHandle] = useState("");
  const [verified, setVerified] = useState(false);

  // Spot form state
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [cityId, setCityId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [link, setLink] = useState("");
  const [desc, setDesc] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("₹ under 200");

  // Data for selects
  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    // Fetch cities
    fetch(`${API_URL}/api/cities`)
      .then(res => res.json())
      .then(data => {
        setCities(data);
        if (data.length) setCityId(data[0].id);
      })
      .catch(console.error);

    // Fetch categories
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length) setCategoryId(data[0].id);
      })
      .catch(console.error);
  }, []);

  const submitSpot = async () => {
    if (!name || !area || !desc || !link || !cityId || !categoryId) {
      return alert("Please fill all required fields.");
    }

    try {
      const res = await fetch(`${API_URL}/api/spots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, area, locationUrl: link, cityId, categoryId,
          time, price, description: desc, submitterEmail: email, submitterHandle: handle
        })
      });
      if (res.ok) {
        alert("Spot added successfully!");
        onBack();
      } else {
        alert("Failed to submit.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  return (
    <PageLayout>
      <Breadcrumb items={[
        { label: "← back", onClick: step === 1 ? onBack : () => setStep(1) }
      ]} />
      {step === 1 && (
        <>
          <PageHeader icon="✏️" title="Add a spot" sub="Who's adding this?" />

          <div className="p-4 rounded-[10px] border border-[#333] mb-3">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-[16px] w-[20px] text-center">✉️</span>
              <span className="text-[14px] font-medium text-white">Email</span>
            </div>

            <div className="text-[13px] text-[#666] pl-[30px] leading-relaxed mb-3">
              We just hold on to this briefly to prevent spam. (Verification disabled).
            </div>

            <div className="pl-[30px]">
              <input
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-[#333] rounded-[6px] py-1.5 px-2.5 text-[13px] bg-black text-white outline-none focus:border-[#666] font-sans"
              />
            </div>
          </div>

          <div className="p-4 rounded-[10px] border border-[#333] mb-3">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-[16px] w-[20px] text-center font-bold">@</span>
              <span className="text-[14px] font-medium text-white">Social handle (Optional)</span>
            </div>
            <div className="text-[13px] text-[#666] pl-[30px] leading-relaxed mb-3">
              Get credit. Add your IG or X handle.
            </div>
            <div className="pl-[30px]">
              <input
                placeholder="@yourhandle"
                value={handle}
                onChange={e => setHandle(e.target.value)}
                className="w-full border border-[#333] rounded-[6px] py-1.5 px-2.5 text-[13px] bg-black text-white outline-none focus:border-[#666] font-sans"
              />
            </div>
          </div>

          <button
            disabled={!email}
            onClick={() => setStep(2)}
            className="w-full mt-4 text-[13px] px-3.5 py-2 rounded-[6px] bg-white text-black font-medium disabled:opacity-30 disabled:cursor-not-allowed font-sans transition-opacity"
          >
            Continue Form →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <PageHeader icon="📍" title="Tell us about it" />

          <div className="flex items-center gap-2 p-2.5 rounded-[6px] border border-[#333] bg-[#111] text-[13px] text-[#888] mb-4">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span>Adding as {handle || email}</span>
          </div>

          <table className="w-full border-collapse mb-0">
            <tbody>
              <tr>
                <td className="text-[13px] text-[#666] w-[130px] pr-3 py-2 align-middle">Spot name</td>
                <td className="py-1">
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-[#333] rounded-[6px] py-1.5 px-2.5 text-[13px] bg-black outline-none focus:border-[#666] font-sans" placeholder="e.g. Natraj Dahi Bhalle" />
                </td>
              </tr>
              <tr>
                <td className="text-[13px] text-[#666] w-[130px] pr-3 py-2 align-middle">Area</td>
                <td className="py-1">
                  <input value={area} onChange={e => setArea(e.target.value)} className="w-full border border-[#333] rounded-[6px] py-1.5 px-2.5 text-[13px] bg-black outline-none focus:border-[#666] font-sans" placeholder="e.g. Chandni Chowk, Old Delhi" />
                </td>
              </tr>
              <tr>
                <td className="text-[13px] text-[#666] w-[130px] pr-3 py-2 align-middle">Location Link</td>
                <td className="py-1">
                  <input value={link} onChange={e => setLink(e.target.value)} className="w-full border border-[#333] rounded-[6px] py-1.5 px-2.5 text-[13px] bg-black outline-none focus:border-[#666] font-sans" placeholder="Google Maps link" />
                </td>
              </tr>
              <tr>
                <td className="text-[13px] text-[#666] w-[130px] pr-3 py-2 align-middle">City</td>
                <td className="py-1">
                  <select value={cityId} onChange={e => setCityId(e.target.value)} className="w-full border border-[#333] rounded-[6px] py-1.5 px-2.5 text-[13px] bg-black outline-none focus:border-[#666] font-sans">
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="text-[13px] text-[#666] w-[130px] pr-3 py-2 align-middle">Category</td>
                <td className="py-1">
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full border border-[#333] rounded-[6px] py-1.5 px-2.5 text-[13px] bg-black outline-none focus:border-[#666] font-sans">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="text-[13px] text-[#666] w-[130px] pr-3 py-2 align-top pt-3.5">Why you love it</td>
                <td className="py-2 pt-2.5">
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full border border-[#333] rounded-[6px] py-2 px-2.5 text-[13px] bg-black outline-none focus:border-[#666] font-sans min-h-[72px] resize-none" placeholder="One honest line..." />
                </td>
              </tr>
              <tr>
                <td className="text-[13px] text-[#666] w-[130px] pr-3 py-2 align-middle">Best time</td>
                <td className="py-1">
                  <input value={time} onChange={e => setTime(e.target.value)} className="w-full border border-[#333] rounded-[6px] py-1.5 px-2.5 text-[13px] bg-black outline-none focus:border-[#666] font-sans" placeholder="e.g. 11am – 8pm" />
                </td>
              </tr>
              <tr>
                <td className="text-[13px] text-[#666] w-[130px] pr-3 py-2 align-middle">Spend</td>
                <td className="py-1">
                  <select value={price} onChange={e => setPrice(e.target.value)} className="w-full border border-[#333] rounded-[6px] py-1.5 px-2.5 text-[13px] bg-black outline-none focus:border-[#666] font-sans">
                    <option>₹ under 200</option><option>₹₹ 200–700</option>
                    <option>₹₹₹ 700–2000</option><option>₹₹₹₹ 2000+</option><option>Free</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 flex gap-2">
            <button onClick={onBack} className="text-[13px] px-3.5 py-1.5 rounded-[6px] border border-[#52525b] bg-black text-white hover:bg-[#111] font-sans">
              Cancel
            </button>
            <button onClick={submitSpot} className="text-[13px] px-3.5 py-1.5 rounded-[6px] bg-white text-black font-medium hover:opacity-85 font-sans">
              Submit spot
            </button>
          </div>
        </>
      )}
    </PageLayout>
  );
}