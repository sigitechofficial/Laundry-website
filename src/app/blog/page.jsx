import React from "react";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

export default function BlogPage() {
  return (
    <>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header type="blog" />
        </div>

        <div className="max-w-[1290px] mx-auto px-5 sm:px-[45px] pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16">
          {/* Main Hero Image */}
          <div className="h-[400px] sm:h-[500px] md:h-[529px] relative rounded-2xl overflow-hidden mb-8 sm:mb-10 lg:mb-12">
            <img
              className="w-full h-full object-cover"
              src="/images/blog/blog.jpg"
              alt="Shirts on hangers"
            />
          </div>

          {/* Main Article Section */}
          <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12 items-start w-full">
            {/* First Content Block */}
            <div className="flex flex-col gap-6 sm:gap-8 items-start w-full">
              <div className="flex flex-col gap-6 sm:gap-8 items-start w-full">
                {/* Article Title */}
                <h1 className="font-sf font-semibold leading-normal text-[36px] sm:text-[42px] md:text-[48px] text-black w-full">
                  5 Mistakes You Might Be Making When Washing Your Gym Clothes
                </h1>

                {/* Introductory Paragraph */}
                <p className="font-sf font-normal leading-normal text-[18px] sm:text-[20px] text-black w-full max-w-[1240px]">
                  Being a parent is a journey filled with countless lessons, and one of the most valuable lessons we can pass on to our children is responsibility. Teaching kids to take ownership of household chores not only lightens the load for parents but also lays the groundwork for essential life skills. However, it's important to make chores fun and educational. One chore that offers a perfect opportunity for learning responsibility is laundry.
                </p>

                {/* First Image */}
                <div className="h-[400px] sm:h-[450px] md:h-[500px] relative rounded-xl overflow-hidden w-full max-w-[807px] my-6 sm:my-8">
                  <img
                    className="w-full h-full object-cover rounded-xl"
                    src="/images/blog/blog2.png"
                    alt="Man with folded laundry"
                  />
                </div>

                {/* Share This */}
                <p className="font-sf font-normal leading-normal text-[32px] sm:text-[36px] md:text-[40px] text-[rgba(0,0,0,0.7)] w-full max-w-[1240px] mt-4 sm:mt-6">
                  Share this:
                </p>
              </div>

              {/* Mistakes List Section */}
              <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12 items-start w-full">
                <div className="flex flex-col gap-6 sm:gap-8 items-start w-full">
                  {/* Mistakes 1-2 */}
                  <div className="flex flex-col gap-6 sm:gap-8 items-start w-full">
                    {/* Mistake 1 */}
                    <div className="flex flex-col gap-3 sm:gap-4 items-start w-full">
                      <h2 className="font-sf font-semibold leading-normal text-[28px] sm:text-[32px] md:text-[36px] text-[rgba(0,0,0,0.8)] w-full">
                        1. Using Fabric Softener
                      </h2>
                      <p className="font-sf font-normal leading-normal text-[18px] sm:text-[20px] text-[rgba(0,0,0,0.7)] w-full">
                        <span className="font-sf font-semibold">Mistake:</span>
                        <span> Fabric softener can cover the fibres of your workout clothes, making them less able to remove sweat and less breathable</span>
                      </p>
                      <p className="font-sf leading-normal text-[18px] sm:text-[20px] text-[rgba(0,0,0,0.7)] w-full">
                        <span className="font-sf font-semibold">Solution: </span>
                        <span className="font-sf font-normal">As an alternative, use a sports-specific detergent that is designed to clean performance fabrics without affecting their functionality</span>
                      </p>
                    </div>

                    {/* Mistake 2 */}
                    <div className="flex flex-col gap-3 sm:gap-4 items-start w-full">
                      <h2 className="font-sf font-semibold leading-normal text-[28px] sm:text-[32px] md:text-[36px] text-[rgba(0,0,0,0.8)] w-full">
                        2. Washing with Hot Water
                      </h2>
                      <p className="font-sf font-normal leading-normal text-[18px] sm:text-[20px] text-[rgba(0,0,0,0.7)] w-full">
                        <span className="font-sf font-semibold">Mistake:</span>
                        <span> Hot water can break down the elasticity and fabric of your gym clothes, leading to shrinkage and damage.</span>
                      </p>
                      <p className="font-sf leading-normal text-[18px] sm:text-[20px] text-[rgba(0,0,0,0.7)] w-full">
                        <span className="font-sf font-semibold">Solution: </span>
                        <span className="font-sf font-normal">As an alternative, use a sports-specific detergent that is designed to clean performance fabrics without affecting their functionality</span>
                      </p>
                    </div>
                  </div>

                  {/* Second Image */}
                  <div className="h-[400px] sm:h-[450px] md:h-[500px] relative rounded-xl overflow-hidden w-full max-w-[807px] my-6 sm:my-8">
                    <img
                      className="w-full h-full object-cover rounded-xl"
                      src="/images/blog/blog3.png"
                      alt="Two women in laundry room"
                    />
                  </div>

                  {/* Mistakes 3-5 */}
                  <div className="flex flex-col gap-6 sm:gap-8 items-start w-full">
                    {/* Mistake 3 */}
                    <div className="flex flex-col gap-3 sm:gap-4 items-start w-full">
                      <h2 className="font-sf font-semibold leading-normal text-[28px] sm:text-[32px] md:text-[36px] text-[rgba(0,0,0,0.8)] w-full">
                        3. Tumble Drying on High Heat
                      </h2>
                      <p className="font-sf font-normal leading-normal text-[18px] sm:text-[20px] text-[rgba(0,0,0,0.7)] w-full">
                        <span className="font-sf font-semibold">Mistake:</span>
                        <span> Fabric softener can cover the fibres of your workout clothes, making them less able to remove sweat and less breathable</span>
                      </p>
                      <p className="font-sf leading-normal text-[18px] sm:text-[20px] text-[rgba(0,0,0,0.7)] w-full">
                        <span className="font-sf font-semibold">Solution: </span>
                        <span className="font-sf font-normal">As an alternative, use a sports-specific detergent that is designed to clean performance fabrics without affecting their functionality</span>
                      </p>
                    </div>

                    {/* Mistake 4 */}
                    <div className="flex flex-col gap-3 sm:gap-4 items-start w-full">
                      <h2 className="font-sf font-semibold leading-normal text-[28px] sm:text-[32px] md:text-[36px] text-[rgba(0,0,0,0.8)] w-full">
                        4. Not Washing Immediately After Use
                      </h2>
                      <p className="font-sf font-normal leading-normal text-[18px] sm:text-[20px] text-[rgba(0,0,0,0.7)] w-full">
                        <span className="font-sf font-semibold">Mistake:</span>
                        <span> Hot water can break down the elasticity and fabric of your gym clothes, leading to shrinkage and damage.</span>
                      </p>
                      <p className="font-sf leading-normal text-[18px] sm:text-[20px] text-[rgba(0,0,0,0.7)] w-full">
                        <span className="font-sf font-semibold">Solution: </span>
                        <span className="font-sf font-normal">As an alternative, use a sports-specific detergent that is designed to clean performance fabrics without affecting their functionality</span>
                      </p>
                    </div>

                    {/* Mistake 5 */}
                    <div className="flex flex-col gap-3 sm:gap-4 items-start w-full">
                      <h2 className="font-sf font-semibold leading-normal text-[28px] sm:text-[32px] md:text-[36px] text-[rgba(0,0,0,0.8)] w-full">
                        5. Using Regular Detergent
                      </h2>
                      <p className="font-sf font-normal leading-normal text-[18px] sm:text-[20px] text-[rgba(0,0,0,0.7)] w-full">
                        <span className="font-sf font-semibold">Mistake:</span>
                        <span> Hot water can break down the elasticity and fabric of your gym clothes, leading to shrinkage and damage.</span>
                      </p>
                      <p className="font-sf leading-normal text-[18px] sm:text-[20px] text-[rgba(0,0,0,0.7)] w-full">
                        <span className="font-sf font-semibold">Solution: </span>
                        <span className="font-sf font-normal">As an alternative, use a sports-specific detergent that is designed to clean performance fabrics without affecting their functionality</span>
                      </p>
                      <p className="font-sf font-normal leading-normal text-[18px] sm:text-[20px] text-[rgba(0,0,0,0.7)] w-full">
                        By avoiding these common mistakes, you can keep your gym clothes looking and smelling fresh while maintaining their performance qualities
                      </p>
                      <p className="font-sf font-normal leading-normal text-[18px] sm:text-[20px] text-[rgba(0,0,0,0.7)] w-full">
                        Gym workout can be exhausting and at times, even laundry can feel like a workout. The good news is, we are here to give you a big lift when it comes to laundry. Our team take proper care of your gym clothes and will prolong their lifespan.
                      </p>
                    </div>
                  </div>

                  {/* Third Image */}
                  <div className="h-[400px] sm:h-[450px] md:h-[500px] relative rounded-xl overflow-hidden w-full max-w-[807px] my-6 sm:my-8">
                    <img
                      className="w-full h-full object-cover rounded-xl"
                      src="/images/blog/blog4.png"
                      alt="Woman loading bags"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <Footer width="max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
    </>
  );
}
