import Tabs from '@/components/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LandingLayout from '@/layouts/landing-layout';
import { SharedData } from '@/types/global';
import { Head } from '@inertiajs/react';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Award, 
  PlayCircle, 
  FileText,
  Download,
  CheckCircle,
  TrendingUp,
  Calendar,
  Globe,
  MessageSquare,
  ShoppingCart,
  Heart,
  Share2,
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { ReactNode } from 'react';
import CourseHeader from './partials/course-header';
import CoursePreview from './partials/course-preview';
import CourseReviews from './partials/course-reviews';
import Curriculum from './partials/curriculum';
import Details from './partials/details';
import Instructor from './partials/instructor';
import Overview from './partials/overview';

export interface CourseDetailsProps extends SharedData {
   course: Course;
   enrollment: CourseEnrollment;
   watchHistory: WatchHistory | null;
   approvalStatus: CourseApprovalValidation;
   wishlists: CourseWishlist[];
   reviews: Pagination<CourseReview>;
   totalReviews: CourseTotalReview;
}

const Show = ({ course, system, translate }: CourseDetailsProps & { translate: any }) => {
   const { button, frontend } = translate;

   // Mock data - replace with actual data from your backend
   const courseStats = {
      students: 15234,
      duration: '30 hours',
      lectures: 245,
      articles: 45,
      downloadable: 120,
      level: course.level || 'Beginner to Advanced',
      language: course.language || 'English',
      lastUpdated: 'January 2025',
      whatYouWillLearn: [
         'Master modern JavaScript from basics to advanced concepts',
         'Build real-world projects and applications',
         'Understand closures, prototypes, and async programming',
         'Learn ES6+ features and best practices',
         'Implement design patterns in JavaScript',
         'Work with APIs and handle asynchronous operations',
      ],
      requirements: [
         'Basic understanding of HTML and CSS',
         'No prior JavaScript knowledge required',
         'A computer with internet connection',
         'Willingness to learn and practice',
      ],
      includes: [
         { icon: PlayCircle, label: '30 hours on-demand video' },
         { icon: FileText, label: '45 articles' },
         { icon: Download, label: '120 downloadable resources' },
         { icon: Award, label: 'Certificate of completion' },
         { icon: Clock, label: 'Full lifetime access' },
         { icon: MessageSquare, label: 'Community support' },
      ],
      rating: 4.8,
      totalRatings: 4567,
   };

   const tabs = [
      {
         value: 'overview',
         label: button.overview,
         Component: <Overview course={course} />,
      },
      {
         value: 'curriculum',
         label: button.curriculum,
         Component: <Curriculum course={course} />,
      },
      {
         value: 'details',
         label: button.details,
         Component: <Details course={course} />,
      },
      {
         value: 'instructor',
         label: button.instructor,
         Component: <Instructor course={course} />,
      },
      {
         value: 'reviews',
         label: button.reviews,
         Component: <CourseReviews />,
      },
   ].filter((tab) => {
      if (tab.value === 'instructor') {
         return system.sub_type === 'collaborative' ? true : false;
      }
      return true;
   });

   const pageTitle = course.meta_title || `${course.title} | ${system.fields?.name}`;
   const pageDescription = course.meta_description || course.short_description || course.description || frontend.learn_comprehensive_course;
   const pageKeywords = course.meta_keywords || `${course.title}, ${frontend.online_course_learning_lms}, ${system.fields?.keywords || 'LMS'}`;
   const ogTitle = course.og_title || course.title;
   const ogDescription = course.og_description || pageDescription;
   const courseImage = course.thumbnail || '';
   const siteName = system.fields?.name;
   const siteUrl = window.location.href;

   return (
      <>
         <Head>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            <meta name="keywords" content={pageKeywords} />
            <meta property="og:type" content="article" />
            <meta property="og:url" content={siteUrl} />
            <meta property="og:title" content={ogTitle} />
            <meta property="og:description" content={ogDescription} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:image" content={courseImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={ogTitle} />
            <meta name="twitter:description" content={ogDescription} />
            {courseImage && <meta name="twitter:image" content={courseImage} />}
         </Head>

         {/* Breadcrumb */}
         <div className="border-b bg-gray-50/50">
            <div className="container py-3">
               <div className="flex items-center gap-2 text-sm text-gray-600">
                  <a href="/" className="hover:text-primary transition-colors">Home</a>
                  <ChevronRight className="h-4 w-4" />
                  <a href="/courses" className="hover:text-primary transition-colors">Courses</a>
                  <ChevronRight className="h-4 w-4" />
                  <a href={`/courses/${course.category}`} className="hover:text-primary transition-colors">
                     {course.category || 'Development'}
                  </a>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-gray-900 font-medium truncate">{course.title}</span>
               </div>
            </div>
         </div>

         {/* Hero Section - PW Skills Style */}
         <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white">
            <div className="container py-8 md:py-12">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Content */}
                  <div className="lg:col-span-2 space-y-6">
                     {/* Badges */}
                     <div className="flex flex-wrap gap-3">
                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                           <TrendingUp className="h-3.5 w-3.5 mr-1" />
                           Bestseller
                        </Badge>
                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                           Updated {courseStats.lastUpdated}
                        </Badge>
                     </div>

                     {/* Title */}
                     <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                        {course.title}
                     </h1>

                     {/* Description */}
                     <p className="text-lg text-gray-200 max-w-3xl">
                        {course.short_description || course.description}
                     </p>

                     {/* Instructor & Stats */}
                     <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                              {course.instructor?.user?.name?.charAt(0) || 'JS'}
                           </div>
                           <div>
                              <p className="text-sm text-gray-300">Created by</p>
                              <p className="font-semibold">{course.instructor?.user?.name || 'Expert Instructor'}</p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                           <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                           <span className="font-bold">{courseStats.rating}</span>
                           <span className="text-gray-300">({courseStats.totalRatings.toLocaleString()} ratings)</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                           <Users className="h-5 w-5" />
                           <span>{courseStats.students.toLocaleString()} students</span>
                        </div>
                     </div>
                  </div>

                  {/* Right Content - Preview Card */}
                  <div className="lg:col-span-1">
                     <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                        <div className="relative group">
                           <img 
                              src={courseImage || 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3'}
                              alt={course.title}
                              className="w-full h-48 object-cover"
                           />
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="default" size="lg" className="gap-2">
                                 <PlayCircle className="h-5 w-5" />
                                 Preview Course
                              </Button>
                           </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                           <div className="text-center">
                              <span className="text-3xl font-bold text-gray-900">
                                 {course.pricing_type === 'paid' ? `$${course.price}` : 'Free'}
                              </span>
                              {course.pricing_type === 'paid' && (
                                 <span className="text-gray-500 line-through ml-2">${course.price * 2}</span>
                              )}
                           </div>
                           
                           <div className="space-y-2">
                              <Button className="w-full gap-2 bg-primary hover:bg-primary/90" size="lg">
                                 <ShoppingCart className="h-5 w-5" />
                                 Enroll Now
                              </Button>
                              <div className="flex gap-2">
                                 <Button variant="outline" className="flex-1 gap-2" size="lg">
                                    <Heart className="h-5 w-5" />
                                    Wishlist
                                 </Button>
                                 <Button variant="outline" className="flex-1 gap-2" size="lg">
                                    <Share2 className="h-5 w-5" />
                                    Share
                                 </Button>
                              </div>
                           </div>
                           
                           <div className="space-y-2 text-sm">
                              <p className="text-green-600 font-medium flex items-center gap-2">
                                 <CheckCircle className="h-4 w-4" />
                                 30-Day Money-Back Guarantee
                              </p>
                              <div className="flex items-center gap-2 text-gray-600">
                                 <Bookmark className="h-4 w-4" />
                                 <span>Full lifetime access</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="container py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left Column - Main Content */}
               <div className="lg:col-span-2 space-y-8">
                  {/* What You'll Learn Section */}
                  <div className="bg-card rounded-xl border p-6">
                     <h2 className="text-xl font-bold mb-4">What you'll learn</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courseStats.whatYouWillLearn.map((item, index) => (
                           <div key={index} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{item}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Course Includes */}
                  <div className="bg-card rounded-xl border p-6">
                     <h2 className="text-xl font-bold mb-4">This course includes:</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courseStats.includes.map((item, index) => {
                           const Icon = item.icon;
                           return (
                              <div key={index} className="flex items-center gap-3">
                                 <Icon className="h-5 w-5 text-primary" />
                                 <span className="text-sm">{item.label}</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* Tabs Section */}
                  <Tabs defaultValue="overview" className="bg-card rounded-xl border">
                     <div className="overflow-x-auto">
                        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
                           {tabs.map(({ label, value }) => (
                              <TabsTrigger
                                 key={value}
                                 value={value}
                                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                              >
                                 {label}
                              </TabsTrigger>
                           ))}
                        </TabsList>
                     </div>

                     <div className="p-6">
                        {tabs.map(({ value, Component }) => (
                           <TabsContent key={value} value={value} className="m-0">
                              {Component}
                           </TabsContent>
                        ))}
                     </div>
                  </Tabs>
               </div>

               {/* Right Column - Sidebar */}
               <div className="space-y-6">
                  {/* Requirements */}
                  <div className="bg-card rounded-xl border p-6">
                     <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Requirements
                     </h2>
                     <ul className="space-y-3">
                        {courseStats.requirements.map((req, index) => (
                           <li key={index} className="text-sm flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                              {req}
                           </li>
                        ))}
                     </ul>
                  </div>

                  {/* Course Features */}
                  <div className="bg-card rounded-xl border p-6">
                     <h2 className="text-lg font-bold mb-4">Course Features</h2>
                     <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-600">Level</span>
                           <span className="font-medium">{courseStats.level}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-600">Language</span>
                           <span className="font-medium">{courseStats.language}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-600">Total Lectures</span>
                           <span className="font-medium">{courseStats.lectures}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-600">Video Duration</span>
                           <span className="font-medium">{courseStats.duration}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Schema.org structured data */}
         <script type="application/ld+json">
            {JSON.stringify({
               '@context': 'https://schema.org',
               '@type': 'Course',
               name: course.title,
               description: pageDescription,
               image: courseImage,
               provider: {
                  '@type': 'Organization',
                  name: siteName,
                  url: window.location.origin,
               },
               instructor: course.instructor
                  ? {
                       '@type': 'Person',
                       name: course.instructor.user?.name || '',
                    }
                  : undefined,
               courseCode: course.slug,
               educationalLevel: course.level,
               inLanguage: course.language,
               offers: {
                  '@type': 'Offer',
                  price: course.price || 0,
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
               },
               aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: courseStats.rating,
                  reviewCount: courseStats.totalRatings,
               },
            })}
         </script>
      </>
   );
};

Show.layout = (page: ReactNode) => <LandingLayout children={page} customizable={false} />;

export default Show;