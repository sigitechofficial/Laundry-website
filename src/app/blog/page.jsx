"use client";
import React from "react";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { useGetBlogsQuery } from "../store/services/api";
import { Spinner } from "@heroui/react";
import { BASE_URL } from "../../../utilities/URL";

const extractBlogsArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.message)) return data.message;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.blogs)) return data.blogs;
  if (Array.isArray(data?.blog)) return data.blog;
  if (data?.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    const inner = data.data;
    if (Array.isArray(inner?.blogs)) return inner.blogs;
    if (Array.isArray(inner?.blog)) return inner.blog;
    if (Array.isArray(inner?.items)) return inner.items;
    if (Array.isArray(inner?.records)) return inner.records;
    if (typeof inner === "object" && inner !== null) return Object.values(inner);
  }
  return [];
};

const getBlogImageUrl = (image) => {
  if (!image) return "/images/blog/blog.jpg";
  if (typeof image === "string" && image.startsWith("http")) return image;
  if (typeof image === "string") return `${BASE_URL.replace(/\/$/, "")}${image.startsWith("/") ? "" : "/"}${image}`;
  return "/images/blog/blog.jpg";
};

export default function BlogPage() {
  const { data, isLoading, isError } = useGetBlogsQuery();
  const blogs = extractBlogsArray(data);

  return (
    <>
      <div className="w-full relative">
        <div className="max-xl:fixed max-xl:z-50 w-full">
          <Header type="blog" />
        </div>

        <div className="max-w-[1290px] mx-auto px-5 sm:px-[4px] pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16">
          {isLoading ? (
            <div className="min-h-[400px] flex justify-center items-center">
              <Spinner size="lg" color="primary" />
            </div>
          ) : isError ? (
            <div className="min-h-[400px] flex justify-center items-center">
              <p className="font-sf text-lg text-red-500">Unable to load blogs. Please try again later.</p>
            </div>
          ) : !blogs?.length ? (
            <div className="min-h-[400px] flex justify-center items-center">
              <p className="font-sf text-lg text-theme-gray-3">No blogs available at the moment.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10 sm:gap-12 lg:gap-16">
              {blogs
                .filter((blog) => blog?.status !== false)
                .map((blog, index) => {
                  const isTextLeft = index % 2 === 0;
                  const textBlock = (
                    <div className="flex flex-col gap-4 sm:gap-6 justify-center w-full lg:w-1/2">
                      <h2 className="font-sf font-semibold leading-normal text-[24px] sm:text-[32px] md:text-[40px] text-black w-full">
                        {blog.title}
                      </h2>
                      <p className="font-sf font-normal leading-relaxed text-[16px] sm:text-[18px] text-theme-gray-3 w-full whitespace-pre-wrap">
                        {blog.description || ""}
                      </p>
                    </div>
                  );
                  const imageBlock = (
                    <div className="h-[280px] sm:h-[350px] md:h-[400px] lg:min-h-[400px] relative rounded-2xl overflow-hidden w-full lg:w-1/2 shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        src={getBlogImageUrl(blog.image)}
                        alt={blog.title || "Blog image"}
                      />
                    </div>
                  );

                  return (
                    <article
                      key={blog.id ?? blog.blogId ?? index}
                      className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10 xl:gap-12 items-center w-full"
                    >
                      {isTextLeft ? (
                        <>
                          {textBlock}
                          {imageBlock}
                        </>
                      ) : (
                        <>
                          {imageBlock}
                          {textBlock}
                        </>
                      )}
                    </article>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      <Footer width="max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
    </>
  );
}
