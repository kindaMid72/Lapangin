

// components
import PriceSettingCard from './components/PriceSettingCard';


export default function PricSetting({}){

    return(<>
        <div className='p-2'>
           <div className='dark:bg-gray-800 bg-gray-300 rounded-xl overflow-hidden w-full'>
                {/* foreach court..... */}
                {/* fetch courts from database, and tract changes, example */}
                <PriceSettingCard courtName={'lapangan basket 1'} price={100000}/>
                <PriceSettingCard courtName={'lapangan basket 1'} price={100000}/>
                <PriceSettingCard courtName={'lapangan basket 1'} price={100000}/>
           </div>
           <div className=''> {/* tax section (if implemented) */}
                
           </div>
        </div>
    
    </>)
}