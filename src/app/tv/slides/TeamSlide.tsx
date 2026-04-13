import { TEAM } from "@/lib/constants";

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

const TEAM_PHOTOS: Record<string, string> = {
  Jay: "/images/team/jay-v2.jpg",
  Kedar: "/images/team/kedar.jpg",
  Zia: "/images/team/zia.jpg",
  Akram: "/images/team/akram.jpg",
  Riaz: "/images/team/riaz-v7.jpg",
  Hamid: "/images/team/hamid-v11.jpg",
};

export default function TeamSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 64px',
        fontFamily: FONT,
      }}
    >
      <p style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 4, color: '#4F56E8', marginBottom: 16 }}>
        Our Team
      </p>
      <h2 style={{ fontSize: 44, fontWeight: 700, color: '#1E293B', marginBottom: 56, margin: '0 0 56px 0' }}>
        Meet the Experts
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          columnGap: 64,
          rowGap: 40,
          maxWidth: 1200,
        }}
      >
        {TEAM.map((member) => (
          <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: '2px solid #E2E8F0',
              }}
            >
              <img
                src={TEAM_PHOTOS[member.name]}
                alt={member.fullName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%' }}
              />
            </div>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1E293B', margin: '0 0 4px 0' }}>{member.fullName}</h3>
              <p style={{ fontSize: 16, color: '#4F56E8', marginBottom: 8, margin: '0 0 8px 0' }}>{member.role}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {member.specialties.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 13,
                      backgroundColor: '#EEF2FF',
                      color: '#4F56E8',
                      padding: '2px 10px',
                      borderRadius: 9999,
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
    </div>
  );
}
