import { TEAM } from "@/lib/constants";
import { SlideShell, Eyebrow, GOLD } from "./_shared";

const TEAM_PHOTOS: Record<string, string> = {
  Jay: "/images/team/jay-v2.jpg",
  Kedar: "/images/team/kedar.jpg",
  Zia: "/images/team/zia.jpg",
  Akram: "/images/team/akram.jpg",
  Riaz: "/images/team/riaz-v7.jpg",
  Hamid: "/images/team/hamid-v11.png",
};

export default function TeamSlide({ cycleCount: _c }: { cycleCount: number }) {
  return (
    <SlideShell padding="0 80px">
      <Eyebrow>Our Team</Eyebrow>
      <h2 style={{ fontSize: 60, fontWeight: 800, color: "#FFFFFF", margin: "20px 0 56px 0" }}>
        Meet the Experts
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          columnGap: 56,
          rowGap: 44,
          maxWidth: 1400,
        }}
      >
        {TEAM.map((member) => (
          <div
            key={member.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "20px 24px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                width: 112,
                height: 112,
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                border: `2px solid ${GOLD}66`,
              }}
            >
              <img
                src={TEAM_PHOTOS[member.name]}
                alt={member.fullName}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 10%" }}
              />
            </div>
            <div>
              <h3 style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", margin: "0 0 4px 0" }}>{member.fullName}</h3>
              <p style={{ fontSize: 22, color: GOLD, margin: "0 0 12px 0" }}>{member.role}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {member.specialties.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 20,
                      backgroundColor: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.85)",
                      padding: "4px 14px",
                      borderRadius: 9999,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlideShell>
  );
}
