/**
 * AppFooter — enterprise multi-column dark footer.
 * Inspired by OLX structure but in the SkillSphere Blue Glass design spec.
 *
 * RSM JS Style: no arrow functions, no destructuring.
 */
function FooterLink(props) {
  var href = props.href || '#';
  var children = props.children;

  return (
    <a
      href={href}
      className="block text-sm py-1 transition-colors duration-200"
      style={{ color: 'rgba(148,163,184,0.65)' }}
      onMouseEnter={function (e) { e.currentTarget.style.color = '#f1f5f9'; }}
      onMouseLeave={function (e) { e.currentTarget.style.color = 'rgba(148,163,184,0.65)'; }}
    >
      {children}
    </a>
  );
}

function FooterColumn(props) {
  var title = props.title;
  var children = props.children;

  return (
    <div className="flex flex-col gap-1">
      <h4
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: 'rgba(99,102,241,0.8)', letterSpacing: '0.18em' }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

function AppFooter() {
  return (
    <footer
      style={{
        background: '#030303',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Top shimmer line */}
      <div
        className="h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
        }}
      />

      {/* Main columns */}
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                  boxShadow: '0 0 14px rgba(99,102,241,0.35)',
                }}
              >
                S
              </div>
              <div
                className="font-black text-sm tracking-tight"
                style={{
                  background: 'linear-gradient(90deg, #a5b4fc, #93c5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                SkillSphere
              </div>
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'rgba(100,116,139,0.6)', maxWidth: '200px' }}
            >
              The premium peer-to-peer campus marketplace for verified students.
            </p>
            {/* Social row */}
            <div className="flex items-center gap-3 mt-1">
              {['𝕏', 'in', 'ig'].map(function (icon) {
                return (
                  <a
                    key={icon}
                    href="#"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(148,163,184,0.6)',
                    }}
                    onMouseEnter={function (e) {
                      e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                      e.currentTarget.style.color = '#a5b4fc';
                    }}
                    onMouseLeave={function (e) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = 'rgba(148,163,184,0.6)';
                    }}
                  >
                    {icon}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Popular Categories */}
          <FooterColumn title="Categories">
            <FooterLink>Tech Services</FooterLink>
            <FooterLink>Academic Help</FooterLink>
            <FooterLink>Electronics</FooterLink>
            <FooterLink>Books & Notes</FooterLink>
            <FooterLink>Design & Art</FooterLink>
            <FooterLink>Photography</FooterLink>
          </FooterColumn>

          {/* Campus Zones */}
          <FooterColumn title="Campus Zones">
            <FooterLink>Engineering Block</FooterLink>
            <FooterLink>Hostel Deals</FooterLink>
            <FooterLink>Library Zone</FooterLink>
            <FooterLink>Canteen Area</FooterLink>
            <FooterLink>Sports Complex</FooterLink>
          </FooterColumn>

          {/* SkillSphere */}
          <FooterColumn title="SkillSphere">
            <FooterLink>About Us</FooterLink>
            <FooterLink>How It Works</FooterLink>
            <FooterLink>Verified Sellers</FooterLink>
            <FooterLink>Post a Gig</FooterLink>
            <FooterLink>Blog</FooterLink>
          </FooterColumn>

          {/* Help */}
          <FooterColumn title="Help">
            <FooterLink>Safety Tips</FooterLink>
            <FooterLink>Report a Listing</FooterLink>
            <FooterLink>Contact Support</FooterLink>
            <FooterLink>FAQ</FooterLink>
            <FooterLink>Community Guidelines</FooterLink>
          </FooterColumn>

        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-xs"
            style={{ color: 'rgba(100,116,139,0.5)' }}
          >
            © 2026 PROJECT 13 All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map(function (label) {
              return (
                <a
                  key={label}
                  href="#"
                  className="text-xs transition-colors duration-200"
                  style={{ color: 'rgba(100,116,139,0.5)' }}
                  onMouseEnter={function (e) { e.currentTarget.style.color = '#a5b4fc'; }}
                  onMouseLeave={function (e) { e.currentTarget.style.color = 'rgba(100,116,139,0.5)'; }}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
