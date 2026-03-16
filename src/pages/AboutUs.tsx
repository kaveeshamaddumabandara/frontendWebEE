import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationBar } from '../components/NavigationBar';
import { Heart, Users, Shield, Clock, Star, Award } from 'lucide-react';

const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <NavigationBar 
        onHome={() => navigate('/login')}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="ElderEase Logo" 
              className="w-32 h-32 object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-emerald-600">ElderEase</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Connecting caring hearts with those who need them most. 
            We're revolutionizing eldercare through technology and compassion.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Sign In to Portal
          </button>
        </div>

        {/* Mission Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 p-12 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            At ElderEase, we believe that every senior deserves dignified, compassionate care in the comfort of their own home. 
            Our mission is to bridge the gap between professional caregivers and families seeking trusted care services, 
            making quality eldercare accessible, affordable, and reliable for everyone.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-8 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Trust & Safety</h3>
            <p className="text-gray-600">
              All our caregivers are thoroughly vetted, background-checked, and trained to ensure 
              the highest standards of care and professionalism.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-8 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Compassion First</h3>
            <p className="text-gray-600">
              We prioritize empathy and understanding in every interaction, treating every senior 
              with the dignity and respect they deserve.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-8 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Support</h3>
            <p className="text-gray-600">
              Round-the-clock availability ensures that care is always accessible when needed, 
              providing peace of mind for families.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gradient-to-br from-emerald-100 to-white rounded-3xl shadow-xl border border-emerald-200 p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              ElderEase was born from a simple observation: finding reliable, compassionate care for elderly 
              loved ones shouldn't be complicated or stressful. Our founders experienced firsthand the challenges 
              families face when searching for trustworthy caregivers.
            </p>
            <p>
              In 2024, we set out to create a platform that would simplify this process, connecting qualified 
              caregivers with families in need. What started as a small local initiative has grown into a 
              comprehensive eldercare ecosystem, serving hundreds of families across the region.
            </p>
            <p>
              Today, ElderEase stands as a testament to the power of technology combined with human compassion. 
              We continue to innovate, always keeping the wellbeing of seniors and their families at the heart 
              of everything we do.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-6 text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">500+</div>
            <div className="text-gray-600 font-medium">Verified Caregivers</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-6 text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">1,000+</div>
            <div className="text-gray-600 font-medium">Families Served</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-6 text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">4.9/5</div>
            <div className="text-gray-600 font-medium">Average Rating</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-6 text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">24/7</div>
            <div className="text-gray-600 font-medium">Support Available</div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Our Commitment</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            We are committed to continuously improving our services, investing in caregiver training, 
            and leveraging technology to enhance the care experience. Our team works tirelessly to ensure 
            that every interaction on our platform reflects our core values of trust, compassion, and excellence.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
              <Award className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Quality Assured</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
              <Star className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Highly Rated</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Fully Verified</span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Experience Quality Eldercare?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join hundreds of families who trust ElderEase for their loved ones' care.
          </p>
          <button className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300">
            Get Started Today by downloading the ElderEase App
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-emerald-50/50 border-t border-emerald-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p className="text-sm">
            © 2026 ElderEase. All rights reserved. | Compassionate Care, Simplified.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
