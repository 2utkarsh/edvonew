import React from 'react';
import AnnouncementBanner from '@/components/announcement-banner';
import SocialStats from '@/components/social-stats';
import Footer from './footer';
import Main from './main';
import Navbar from './navbar';

interface LayoutProps {
   children: React.ReactNode;
   language?: boolean;
   navbarHeight?: boolean;
   customizable?: boolean;
   showAnnouncement?: boolean;
   showSocialStats?: boolean;
}

const LandingLayout = ({ 
   children, 
   language = false, 
   navbarHeight = true, 
   customizable,
   showAnnouncement = true,
   showSocialStats = true 
}: LayoutProps) => {
   return (
      <Main>
         <div className="flex min-h-screen flex-col justify-between overflow-x-hidden">
            {showAnnouncement && <AnnouncementBanner />}
            <main>
               <Navbar heightCover={navbarHeight} customizable={customizable} language={language} />

               {children}
            </main>
            {showSocialStats && <SocialStats />}
            <Footer />
         </div>
      </Main>
   );
};

export default LandingLayout;
