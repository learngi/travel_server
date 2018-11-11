-- phpMyAdmin SQL Dump
-- version 4.7.9
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 11, 2018 at 05:13 PM
-- Server version: 10.1.31-MariaDB
-- PHP Version: 7.2.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `travel`
--

-- --------------------------------------------------------

--
-- Table structure for table `acadamics`
--

CREATE TABLE `acadamics` (
  `aid` int(11) NOT NULL,
  `name` varchar(99) NOT NULL,
  `availability` varchar(50) NOT NULL,
  `amount` float(10,2) NOT NULL,
  `date` date NOT NULL,
  `departure` varchar(100) NOT NULL,
  `depature_time` datetime NOT NULL,
  `return_time` datetime NOT NULL,
  `no_of_days` varchar(15) NOT NULL,
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `acadamics_images`
--

CREATE TABLE `acadamics_images` (
  `ai_id` int(11) NOT NULL,
  `aid` int(11) NOT NULL,
  `day` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `image` text NOT NULL,
  `created_on` datetime DEFAULT CURRENT_TIMESTAMP,
  `modified_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `carousel`
--

CREATE TABLE `carousel` (
  `id` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `place_name` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `carousel`
--

INSERT INTO `carousel` (`id`, `image`, `type`, `place_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'pexels-photo-197657-700x466.jpeg', 'offers', 'tokya', 1, '2018-10-23 22:23:22', NULL),
(2, 'pexels-photo-1-700x466.jpg', 'offers', 'USA', 1, '2018-10-23 22:49:11', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `c_id` int(11) NOT NULL,
  `c_name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`c_id`, `c_name`, `created_at`, `updated_at`) VALUES
(1, 'offers', '2018-10-26 06:51:12', NULL),
(2, 'designations', '2018-10-26 06:51:12', NULL),
(3, 'tours', '2018-10-26 06:51:44', NULL),
(4, 'internations', '2018-10-26 06:51:44', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tour_description`
--

CREATE TABLE `tour_description` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `tag_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `status` tinyint(2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tour_description`
--

INSERT INTO `tour_description` (`id`, `title`, `description`, `tag_id`, `category_id`, `image_path`, `status`, `created_at`, `updated_at`) VALUES
(1, 'test', 'zdfsdfsfd', 1, 1, 'Tokyo_Dollarphotoclub_72848283-copy.jpg', 1, '2018-10-26 07:10:46', NULL),
(2, 'yrtyrty', 'rtyrtyrt', 3, 1, 'Tokyo_Dollarphotoclub_72848283-copy.jpg', 1, '2018-10-26 07:15:42', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobile` int(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL,
  `course_id` int(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `name`, `mobile`, `email`, `role`, `course_id`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2a$10$3DhuDw61Ko22hKL5f8DpLOfoQMrUsVg46z4z5pxP8EkEJOx2RU5fq', 'bhaskararao Sunkari', 2147483647, 'developer2.it@raghues.com', 'admin', 1, '2018-07-23 05:04:12', 0),
(5, 'bhaskar', '$2a$10$3DhuDw61Ko22hKL5f8DpLOfoQMrUsVg46z4z5pxP8EkEJOx2RU5fq', 'bhaskr', 2147483647, 'sunkari.bhaskarrao@gmail.com', 'user.', 1, '2018-07-23 05:04:17', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `acadamics`
--
ALTER TABLE `acadamics`
  ADD PRIMARY KEY (`aid`);

--
-- Indexes for table `acadamics_images`
--
ALTER TABLE `acadamics_images`
  ADD PRIMARY KEY (`ai_id`);

--
-- Indexes for table `carousel`
--
ALTER TABLE `carousel`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`c_id`);

--
-- Indexes for table `tour_description`
--
ALTER TABLE `tour_description`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `acadamics`
--
ALTER TABLE `acadamics`
  MODIFY `aid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `acadamics_images`
--
ALTER TABLE `acadamics_images`
  MODIFY `ai_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `carousel`
--
ALTER TABLE `carousel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `c_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tour_description`
--
ALTER TABLE `tour_description`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
