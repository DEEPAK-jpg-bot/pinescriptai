import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './button';
import { Check } from 'lucide-react';

const PricingCard = ({ plan, price, features, cta, popular }) => (
    <div className={`glass-card p-10 rounded-lg flex flex-col gap-8 ${popular ? 'border-[#3B82F6]/50 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : ''} relative overflow-hidden`}>
        {popular && (
            <div className="absolute top-4 right-4 bg-[#3B82F6] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded">
                Most Popular
            </div>
        )}
        <div>
            <h3 className="text-2xl font-bold mb-4">{plan}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">${price}</span>
                <span className="text-gray-design text-sm">/per month</span>
            </div>
        </div>
        <ul className="flex-1 space-y-4">
            {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-design">
                    <Check size={16} className="text-[#3B82F6]" /> {feature}
                </li>
            ))}
        </ul>
        <Link to="/signup">
            <Button
                variant={popular ? "default" : "outline"}
                className={`w-full h-12 rounded-full font-bold text-sm ${popular ? 'blue-glow-button' : 'bg-white/5 border-white/10'}`}
            >
                {cta}
            </Button>
        </Link>
    </div>
);

export default PricingCard;
