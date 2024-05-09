"use client";
import React, { useEffect, useRef, useState } from 'react'
import { Content, asImageSrc, isFilled } from '@prismicio/client';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MdArrowOutward } from 'react-icons/md';
import {gsap} from 'gsap';

gsap.registerPlugin(ScrollTrigger);

type ContentListProps = {
  items: Content.LinksTreeDocument[] | Content.ProjectListDocument[];
  contentType: Content.ContentIndexSlice['primary']['content_type'];
  checkout: Content.ContentIndexSlice['primary']['view_more'];
  fallbackitemimage: Content.ContentIndexSlice['primary']['fallback_image'];
}


export default function ContentList({items, contentType, checkout = "CheckOut", fallbackitemimage} : ContentListProps) {

  const component = useRef(null);
  const itemsRef = useRef<Array<HTMLLIElement | null>>([]);
  const revealRef = useRef(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [currentItem, setcurrentItem] = useState<null | number>(null);
 
  useEffect(() => {
    let ctx = gsap.context(() => {
      itemsRef.current.forEach((item, index) => {
        gsap.fromTo(
          item,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.3,
            ease: "elastic.out(1,0.3)",
            stagger: 0.2,
            scrollTrigger: {
              trigger: item,
              start: "top bottom-=100px",
              end: "bottom center",
              toggleActions: "play none none none",
            },
          },
        );
      });

      return () => ctx.revert(); 
    }, component);
  }, []);

  useEffect(() => {

    const handleMouseMove = (e: MouseEvent) => {
      const mousePos = { x: e.clientX, y: e.clientY + window.scrollY };
      const speed = Math.sqrt(Math.pow(mousePos.x - lastMousePosition.current.x, 2));

      let ctx = gsap.context(() => {
        if (currentItem !== null) {
          const maxY = window.scrollY + window.innerHeight - 350;
          const maxX = window.innerWidth - 250;

          gsap.to(revealRef.current, {
            x: gsap.utils.clamp(0, maxX, mousePos.x - 110),
            y: gsap.utils.clamp(0, maxY, mousePos.y - 160),
            rotation: speed * (mousePos.x > lastMousePosition.current.x ? 1 : -1), 
            ease: "back.out(2)",
            duration: 1.3,
          });
          gsap.to(revealRef.current, {
            opacity: hovering ? 1 : 0,
            visibility: "visible",
            ease: "power3.out",
            duration: 0.4,
          });
        }
        lastMousePosition.current = mousePos;
        return () => ctx.revert(); 
      }, component);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hovering, currentItem]);



  const onMouseEnter = (index: number) => {
    setcurrentItem(index);
    if (!hovering) setHovering(true);
  }
  const onMouseLeave = () => {  
    setHovering(false);
    setcurrentItem(null);
  }

  const contentImages = items.map((item) => {
    const image = isFilled.image(item.data.hover_image) ? item.data.hover_image : fallbackitemimage;
    return asImageSrc(image, {fit:"crop", width: 220, height: 220,exp:-10 });
  });
  useEffect(() => {
    contentImages.forEach((url) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
    });
  }, [contentImages]);

  return (
    <>
      <ul
        ref={component}
        className="grid border-b border-b-slate-100"
        onMouseLeave={onMouseLeave}
      >
        {items.map((post, index) => (
          <li
            key={index}
            ref= {(el) => {
              if (el) {
                itemsRef.current[index] = el;
              }
            }}
            onMouseEnter={() => onMouseEnter(index)}
            className="list-item opacity-0"
          >
            <a
              href={post.data.link as string} target="_blank" 
              className="flex flex-col justify-between border-t border-t-slate-100 py-10  text-slate-200 md:flex-row "
              aria-label={post.data.title || ""}
            >
              <div className="flex flex-col">
                <span className="text-3xl font-bold">{post.data.title}</span>
                <div className="flex gap-3 text-yellow-400">
                {post.tags.map((tag, index) => (
                  <span key={index} className="text-lg font-bold md:w-[500px] w-[300px]  overflow-x-auto no-scrollbar">
                    {tag}
                  </span>
                ))}
              </div>
              </div>
              <span className="ml-auto flex items-center gap-2 text-xl font-medium md:ml-0">
                {checkout} <MdArrowOutward />
              </span>
            </a>
          </li>
        ))}

        <div
          className="hover-reveal pointer-events-none absolute left-0 top-0 -z-10 h-[260px] w-[220px] rounded-lg bg-cover bg-center opacity-0 transition-[background] duration-300"
          style={{
            backgroundImage: currentItem !== null ? `url(${contentImages[currentItem]})` : "",
          }}
          ref={revealRef}
        ></div>
      </ul>
    </>
  );
}



