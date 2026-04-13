import Image from "next/image";
import { TEAM } from "@/lib/constants";

const TEAM_PHOTOS: Record<string, string> = {
  Jay: "/images/team/jay-v2.jpg",
  Kedar: "/images/team/kedar.jpg",
  Zia: "/images/team/zia.jpg",
  Akram: "/images/team/akram.jpg",
  Riaz: "/images/team/riaz-v7.jpg",
  Hamid: "/images/team/hamid-v11.jpg",
};

const PHOTO_POSITIONS: Record<string, string> = {
  Jay: "object-[50%_10%]",
  Kedar: "object-[50%_10%]",
  Zia: "object-[50%_10%]",
  Akram: "object-[50%_10%]",
  Riaz: "object-[50%_10%]",
  Hamid: "object-[50%_10%]",
};

export default function TeamSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full bg-[#F8FAFC] flex flex-col items-center justify-center px-16">
      <p className="text-[16px] uppercase tracking-[4px] text-[#4F56E8] mb-4">Our Team</p>
      <h2 className="text-[44px] font-bold text-[#1E293B] mb-14">Meet the Experts</h2>
      <div className="grid grid-cols-3 gap-x-16 gap-y-10 max-w-[1200px]">
        {TEAM.map((member) => (
          <div key={member.name} className="flex items-center gap-5">
            <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden shrink-0 border-2 border-[#E2E8F0]">
              <Image
                src={TEAM_PHOTOS[member.name]}
                alt={member.fullName}
                fill
                className={`object-cover ${PHOTO_POSITIONS[member.name]}`}
                sizes="200px"
                quality={90}
              />
            </div>
            <div>
              <h3 className="text-[22px] font-bold text-[#1E293B]">{member.fullName}</h3>
              <p className="text-[16px] text-[#4F56E8] mb-2">{member.role}</p>
              <div className="flex flex-wrap gap-1.5">
                {member.specialties.slice(0, 3).map((s) => (
                  <span key={s} className="text-[13px] bg-[#EEF2FF] text-[#4F56E8] px-2.5 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
