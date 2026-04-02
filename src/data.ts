import { Question } from './types';

export const questions: Question[] = [
  // --- PHẦN 1: TRẮC NGHIỆM KHÁCH QUAN ---
  {
    id: 'mc1',
    type: 'multiple_choice',
    text: 'Vị trí địa lí nước ta nằm ở',
    options: [
      'rìa phía đông của bán đảo Đông Dương.',
      'trung tâm châu Á.',
      'phía tây bán đảo Đông Dương.',
      'hoàn toàn ở xích đạo.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Vị trí địa lí và phạm vi lãnh thổ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc2',
    type: 'multiple_choice',
    text: 'Tính chất nhiệt đới của khí hậu nước ta được quy định bởi',
    options: [
      'vị trí nằm trong vùng nội chí tuyến.',
      'địa hình chủ yếu là đồi núi.',
      'hoạt động của gió mùa.',
      'tiếp giáp với Biển Đông.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc3',
    type: 'multiple_choice',
    text: 'Nguyên nhân chủ yếu làm cho thiên nhiên nước ta phân hóa Bắc - Nam là do',
    options: [
      'lãnh thổ kéo dài theo chiều vĩ tuyến.',
      'sự phân hóa của địa hình.',
      'tác động của Biển Đông.',
      'vị trí nằm trong vùng nội chí tuyến.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc4',
    type: 'multiple_choice',
    text: 'Để ứng phó với biến đổi khí hậu và phát triển bền vững, định hướng quan trọng trong sử dụng tài nguyên ở nước ta là',
    options: [
      'chuyển đổi sang năng lượng tái tạo và giảm phát thải khí nhà kính.',
      'tăng cường khai thác tối đa tài nguyên khoáng sản.',
      'mở rộng diện tích đất nông nghiệp bằng mọi giá.',
      'đẩy mạnh phát triển các ngành công nghiệp nặng.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Vấn đề sử dụng hợp lí tài nguyên thiên nhiên và bảo vệ môi trường',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc5',
    type: 'multiple_choice',
    text: 'Đặc điểm nào sau đây đúng với dân số nước ta hiện nay?',
    options: [
      'Quy mô dân số lớn.',
      'Tỉ lệ gia tăng tự nhiên rất cao.',
      'Cơ cấu dân số trẻ.',
      'Phân bố dân cư rất đồng đều.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc6',
    type: 'multiple_choice',
    text: 'Đặc điểm nổi bật của quá trình đô thị hóa ở nước ta hiện nay theo định hướng mới là',
    options: [
      'phát triển đô thị thông minh, đô thị xanh và bền vững.',
      'chỉ tập trung phát triển các siêu đô thị.',
      'mở rộng diện tích đô thị tự phát.',
      'hạn chế tối đa sự di dân từ nông thôn ra thành thị.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí dân cư',
    lesson: 'Đô thị hoá',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc7',
    type: 'multiple_choice',
    text: 'Theo định hướng phát triển mới, sự chuyển dịch cơ cấu kinh tế ở nước ta hiện nay đặc biệt chú trọng phát triển',
    options: [
      'kinh tế xanh, kinh tế tuần hoàn và chuyển đổi số.',
      'công nghiệp khai khoáng và chế biến thô.',
      'nông nghiệp quảng canh và thủ công nghiệp.',
      'các ngành công nghiệp sử dụng nhiều lao động phổ thông.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc8',
    type: 'multiple_choice',
    text: 'Trong giai đoạn hiện nay, phát triển công nghiệp nước ta đang hướng mạnh vào các ngành',
    options: [
      'công nghệ cao, công nghệ thông tin và năng lượng tái tạo.',
      'khai thác tài nguyên thiên nhiên thô.',
      'sử dụng nhiều năng lượng hóa thạch.',
      'gia công lắp ráp với trình độ công nghệ thấp.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc9',
    type: 'multiple_choice',
    text: 'Loại hình giao thông vận tải có khối lượng luân chuyển hàng hóa lớn nhất nước ta là',
    options: [
      'đường biển.',
      'đường bộ.',
      'đường sắt.',
      'đường hàng không.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc10',
    type: 'multiple_choice',
    text: 'Định hướng phát triển ngành thủy sản nước ta hiện nay là',
    options: [
      'phát triển nuôi trồng thủy sản công nghệ cao, bền vững và bảo vệ sinh thái.',
      'tăng cường đánh bắt ven bờ để giải quyết việc làm.',
      'chỉ tập trung xuất khẩu thủy sản thô chưa qua chế biến.',
      'mở rộng tối đa diện tích nuôi trồng bất chấp tác động môi trường.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc11',
    type: 'multiple_choice',
    text: 'Vùng chuyên canh cây công nghiệp lớn nhất nước ta là',
    options: [
      'Đông Nam Bộ.',
      'Tây Nguyên.',
      'Trung du và miền núi phía Bắc.',
      'Đồng bằng sông Cửu Long.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đông Nam Bộ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc12',
    type: 'multiple_choice',
    text: 'Thế mạnh nổi bật của Trung du và miền núi phía Bắc là',
    options: [
      'khai thác khoáng sản và thủy điện.',
      'trồng cây lương thực.',
      'nuôi trồng thủy sản nước mặn.',
      'phát triển công nghiệp nhẹ.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Khai thác thế mạnh ở Trung du và miền núi phía Bắc',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc13',
    type: 'multiple_choice',
    text: 'Khó khăn lớn nhất về tự nhiên đối với Đồng bằng sông Cửu Long là',
    options: [
      'xâm nhập mặn và hạn hán.',
      'địa hình thấp trũng.',
      'bão và áp thấp nhiệt đới.',
      'diện tích đất phèn, đất mặn lớn.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc14',
    type: 'multiple_choice',
    text: 'Vấn đề phát triển công nghiệp ở Đồng bằng sông Hồng hiện nay đang hướng trọng tâm vào',
    options: [
      'các ngành công nghiệp trọng điểm, công nghệ cao và thân thiện với môi trường.',
      'khai thác và chế biến khoáng sản thô để xuất khẩu.',
      'các ngành công nghiệp sử dụng nhiều năng lượng và tài nguyên.',
      'phát triển công nghiệp nặng ở tất cả các địa phương.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc15',
    type: 'multiple_choice',
    text: 'Ý nghĩa chủ yếu của việc phát triển kinh tế biển ở Nam Trung Bộ là',
    options: [
      'phát huy thế mạnh, nâng cao vị thế vùng.',
      'tạo việc làm, tăng thu nhập.',
      'thu hút vốn đầu tư nước ngoài.',
      'bảo vệ chủ quyền biển đảo.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc16',
    type: 'multiple_choice',
    text: 'Vấn đề quan trọng nhất trong phát triển công nghiệp ở Đông Nam Bộ là',
    options: [
      'phát triển cơ sở hạ tầng năng lượng.',
      'thu hút lao động.',
      'mở rộng diện tích đất công nghiệp.',
      'bảo vệ môi trường.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đông Nam Bộ',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc17',
    type: 'multiple_choice',
    text: 'Bão ở nước ta thường tập trung nhiều nhất vào tháng',
    options: [
      '9.',
      '8.',
      '10.',
      '11.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên tai và biện pháp phòng chống',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc18',
    type: 'multiple_choice',
    text: 'Để thể hiện sự chuyển dịch cơ cấu GDP của nước ta giai đoạn 2010 - 2020, biểu đồ nào sau đây là thích hợp nhất?',
    options: [
      'Biểu đồ miền.',
      'Biểu đồ cột.',
      'Biểu đồ đường.',
      'Biểu đồ kết hợp.'
    ],
    correctAnswerIndex: 0,
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc19',
    type: 'multiple_choice',
    text: 'Đặc điểm địa hình nhiều đồi núi thấp đã làm cho',
    options: [
      'tính chất nhiệt đới ẩm gió mùa được bảo toàn.',
      'thiên nhiên có sự phân hóa sâu sắc.',
      'địa hình nước ta có sự phân bậc rõ rệt.',
      'đồng bằng chiếm phần lớn diện tích.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Đặc điểm chung của tự nhiên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc20',
    type: 'multiple_choice',
    text: 'Tình hình sử dụng lao động theo ngành kinh tế ở nước ta hiện nay có đặc điểm là',
    options: [
      'tỉ trọng lao động trong khu vực nông, lâm, thuỷ sản giảm.',
      'tỉ trọng lao động trong khu vực công nghiệp và xây dựng giảm.',
      'tỉ trọng lao động trong khu vực dịch vụ luôn thấp nhất.',
      'lao động tập trung chủ yếu ở khu vực công nghiệp.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc21',
    type: 'multiple_choice',
    text: 'Đặc điểm nổi bật của khu công nghệ cao ở nước ta là',
    options: [
      'tập trung các doanh nghiệp nghiên cứu, phát triển và ứng dụng công nghệ cao.',
      'chủ yếu sử dụng nguồn lao động phổ thông, chưa qua đào tạo.',
      'phân bố chủ yếu ở các vùng nông thôn, miền núi để tạo việc làm.',
      'chuyên khai thác và chế biến tài nguyên khoáng sản thô.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Tổ chức lãnh thổ công nghiệp',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc22',
    type: 'multiple_choice',
    text: 'Cây công nghiệp lâu năm được phát triển mạnh ở Nam Trung Bộ chủ yếu dựa vào điều kiện thuận lợi nào sau đây?',
    options: [
      'Đất badan màu mỡ và khí hậu cận xích đạo.',
      'Nguồn nước ngầm phong phú và địa hình bằng phẳng.',
      'Khí hậu có mùa đông lạnh và đất feralit.',
      'Nguồn lao động dồi dào và thị trường rộng lớn.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc23',
    type: 'multiple_choice',
    text: 'Mục đích chủ yếu của việc trồng rừng ven biển ở Bắc Trung Bộ là',
    options: [
      'chắn gió bão, ngăn cát bay, cát chảy.',
      'cung cấp gỗ cho công nghiệp chế biến.',
      'bảo vệ môi trường sinh thái, giữ nước ngầm.',
      'tạo cảnh quan phát triển du lịch sinh thái.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Bắc Trung Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc24',
    type: 'multiple_choice',
    text: 'Hoạt động nội thương của nước ta hiện nay phát triển mạnh chủ yếu do',
    options: [
      'sản xuất phát triển, mức sống nhân dân tăng.',
      'hàng hóa đa dạng, nhiều thành phần kinh tế tham gia.',
      'dân số đông, nhu cầu tiêu dùng ngày càng lớn.',
      'hội nhập quốc tế sâu rộng, thu hút nhiều vốn đầu tư.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Thương mại và du lịch',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc25',
    type: 'multiple_choice',
    text: 'Đặc điểm nào sau đây không đúng với vị trí địa lí của vùng Đồng bằng sông Hồng?',
    options: [
      'Giáp với vùng Bắc Trung Bộ ở phía nam.',
      'Giáp với vịnh Bắc Bộ ở phía đông.',
      'Nằm trong vùng kinh tế trọng điểm phía Bắc.',
      'Tiếp giáp với nước bạn Lào ở phía tây.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc26',
    type: 'multiple_choice',
    text: 'Sự thay đổi cơ cấu lao động theo thành phần kinh tế ở nước ta hiện nay chủ yếu do',
    options: [
      'sự phát triển của nền kinh tế hàng hóa nhiều thành phần.',
      'tác động của quá trình đô thị hóa.',
      'sự gia tăng dân số tự nhiên.',
      'chính sách xuất khẩu lao động.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc27',
    type: 'multiple_choice',
    text: 'Sự phân hóa thiên nhiên theo độ cao ở nước ta biểu hiện rõ nhất qua sự thay đổi của',
    options: [
      'khí hậu và sinh vật.',
      'địa hình và đất đai.',
      'sông ngòi và khoáng sản.',
      'nhiệt độ và lượng mưa.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc28',
    type: 'multiple_choice',
    text: 'Ngành công nghiệp thực phẩm của nước ta phân bố chủ yếu dựa vào',
    options: [
      'nguồn nguyên liệu và thị trường tiêu thụ.',
      'nguồn lao động dồi dào và giá rẻ.',
      'cơ sở hạ tầng và chính sách đầu tư.',
      'nguồn vốn lớn và công nghệ hiện đại.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc29',
    type: 'multiple_choice',
    text: 'Khó khăn lớn nhất về tự nhiên đối với việc phát triển cây công nghiệp lâu năm ở Nam Trung Bộ là',
    options: [
      'mùa khô kéo dài gây thiếu nước nghiêm trọng.',
      'địa hình phân bậc, khó cơ giới hóa.',
      'đất đai dễ bị xói mòn, rửa trôi.',
      'khí hậu có sự phân hóa theo độ cao.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc30',
    type: 'multiple_choice',
    text: 'Ý nghĩa chủ yếu của việc phát triển các tuyến đường ngang ở Nam Trung Bộ là',
    options: [
      'mở rộng giao lưu với Tây Nguyên và các nước láng giềng.',
      'thúc đẩy sự phát triển kinh tế - xã hội của các huyện phía tây.',
      'tạo điều kiện khai thác tiềm năng kinh tế biển.',
      'nâng cao vai trò trung chuyển của vùng trên cả nước.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc31',
    type: 'multiple_choice',
    text: 'Định hướng quan trọng trong phát triển kinh tế biển ở Đồng bằng sông Hồng là',
    options: [
      'phát triển tổng hợp cảng biển, du lịch biển và khai thác hải sản.',
      'chỉ tập trung vào khai thác dầu khí ở thềm lục địa.',
      'hạn chế phát triển du lịch để bảo vệ môi trường biển.',
      'chủ yếu phát triển nghề làm muối ở các tỉnh ven biển.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc32',
    type: 'multiple_choice',
    text: 'Đặc điểm nổi bật của địa hình vùng núi Tây Bắc là',
    options: [
      'có địa hình cao nhất nước ta, hướng tây bắc - đông nam.',
      'gồm các dãy núi song song và so le nhau hướng tây bắc - đông nam.',
      'chủ yếu là đồi núi thấp, hướng vòng cung.',
      'gồm các cao nguyên xếp tầng, sườn đông dốc.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Đặc điểm chung của tự nhiên',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc33',
    type: 'multiple_choice',
    text: 'Sự hình thành các vùng chuyên canh nông nghiệp ở nước ta có ý nghĩa chủ yếu là',
    options: [
      'tạo ra khối lượng nông sản hàng hóa lớn, chất lượng cao.',
      'khai thác tốt hơn các điều kiện tự nhiên của mỗi vùng.',
      'giải quyết việc làm cho người lao động ở nông thôn.',
      'thúc đẩy quá trình công nghiệp hóa, đô thị hóa.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc34',
    type: 'multiple_choice',
    text: 'Định hướng quan trọng nhất để phát triển du lịch bền vững ở nước ta hiện nay là',
    options: [
      'khai thác hợp lí tài nguyên, bảo vệ môi trường và tôn trọng văn hóa bản địa.',
      'tăng cường xây dựng các khu nghỉ dưỡng cao cấp ở mọi nơi.',
      'tập trung tối đa vào việc thu hút khách du lịch quốc tế.',
      'khai thác triệt để các tài nguyên thiên nhiên để tăng doanh thu.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Thương mại và du lịch',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc35',
    type: 'multiple_choice',
    text: 'Thế mạnh hàng đầu của Đông Nam Bộ trong phát triển kinh tế là',
    options: [
      'khai thác dầu khí và phát triển công nghiệp.',
      'sản xuất lương thực, thực phẩm.',
      'khai thác khoáng sản và thủy điện.',
      'phát triển nông nghiệp sinh thái.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đông Nam Bộ',
    cognitiveLevel: 'Nhận biết'
  },

  // --- PHẦN 2: TRẮC NGHIỆM ĐÚNG/SAI ---
  {
    id: 'tf1',
    type: 'true_false',
    text: 'Cho thông tin sau về khí hậu nước ta: "Khí hậu nước ta mang tính chất nhiệt đới ẩm gió mùa, phân hóa đa dạng theo chiều Bắc - Nam, Đông - Tây và theo độ cao."',
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf1_a', text: 'a) Tính chất nhiệt đới do nước ta nằm hoàn toàn trong vùng nội chí tuyến.', isTrue: true },
      { id: 'tf1_b', text: 'b) Gió mùa mùa đông mang lại thời tiết lạnh, khô cho toàn bộ lãnh thổ nước ta.', isTrue: false },
      { id: 'tf1_c', text: 'c) Sự phân hóa khí hậu Bắc - Nam chủ yếu do tác động của dãy Bạch Mã.', isTrue: false },
      { id: 'tf1_d', text: 'd) Càng lên cao nhiệt độ càng giảm, tạo nên sự phân hóa khí hậu theo độ cao.', isTrue: true }
    ]
  },
  {
    id: 'tf2',
    type: 'true_false',
    text: 'Về ngành nông nghiệp nước ta: "Nông nghiệp nước ta đang trong quá trình chuyển dịch mạnh mẽ theo hướng nông nghiệp sinh thái, ứng dụng công nghệ cao và thích ứng với biến đổi khí hậu."',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf2_a', text: 'a) Nông nghiệp sinh thái chú trọng vào việc tăng năng suất tối đa bằng mọi giá thông qua sử dụng phân bón hóa học.', isTrue: false },
      { id: 'tf2_b', text: 'b) Ứng dụng công nghệ cao giúp nâng cao giá trị gia tăng và chất lượng nông sản xuất khẩu.', isTrue: true },
      { id: 'tf2_c', text: 'c) Chuyển đổi cơ cấu cây trồng, vật nuôi là một trong những giải pháp quan trọng để thích ứng với biến đổi khí hậu.', isTrue: true },
      { id: 'tf2_d', text: 'd) Việc phát triển nông nghiệp hiện nay không cần quan tâm đến thị trường tiêu thụ quốc tế.', isTrue: false }
    ]
  },
  {
    id: 'tf3',
    type: 'true_false',
    text: 'Về Đồng bằng sông Cửu Long: "Đồng bằng sông Cửu Long đang chịu tác động mạnh mẽ của biến đổi khí hậu, nước biển dâng. Việc phát triển kinh tế - xã hội ở đây cần theo hướng thuận thiên và bền vững."',
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf3_a', text: 'a) Xâm nhập mặn và sạt lở bờ sông, bờ biển là những thách thức lớn nhất do biến đổi khí hậu gây ra đối với vùng.', isTrue: true },
      { id: 'tf3_b', text: 'b) Phát triển theo hướng "thuận thiên" nghĩa là hoàn toàn phụ thuộc vào tự nhiên, không cần các công trình thủy lợi.', isTrue: false },
      { id: 'tf3_c', text: 'c) Chuyển đổi từ trồng lúa sang nuôi trồng thủy sản ở các vùng ngập mặn là một giải pháp thích ứng hiệu quả.', isTrue: true },
      { id: 'tf3_d', text: 'd) Vùng này cần tập trung phát triển các ngành công nghiệp nặng để thúc đẩy tăng trưởng kinh tế nhanh chóng.', isTrue: false }
    ]
  },
  {
    id: 'tf4',
    type: 'true_false',
    text: 'Cho bảng số liệu về GDP của một số quốc gia Đông Nam Á năm 2022 (Đơn vị: Tỉ USD):\n\n| Quốc gia | GDP (Tỉ USD) |\n|---|---|\n| Indonesia | 1319.1 |\n| Thái Lan | 495.3 |\n| Việt Nam | 408.8 |\n| Malaysia | 406.3 |',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Khu vực Đông Nam Á (Lớp 11)',
    context: 'Bảng số liệu GDP năm 2022: Indonesia (1319.1), Thái Lan (495.3), Việt Nam (408.8), Malaysia (406.3).',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf4_a', text: 'a) Indonesia có quy mô GDP lớn nhất trong số các quốc gia trên.', isTrue: true },
      { id: 'tf4_b', text: 'b) GDP của Việt Nam cao hơn Thái Lan.', isTrue: false },
      { id: 'tf4_c', text: 'c) Biểu đồ thích hợp nhất để thể hiện quy mô GDP của các quốc gia này năm 2022 là biểu đồ cột.', isTrue: true },
      { id: 'tf4_d', text: 'd) GDP của Malaysia gấp hơn 2 lần GDP của Việt Nam.', isTrue: false }
    ]
  },
  {
    id: 'tf5',
    type: 'true_false',
    text: 'Đọc đoạn thông tin sau về dân số nước ta: "Nước ta có quy mô dân số lớn, cơ cấu dân số đang có sự thay đổi nhanh chóng. Tỉ lệ gia tăng tự nhiên đã giảm nhưng mỗi năm dân số vẫn tăng thêm khoảng 1 triệu người."',
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf5_a', text: 'a) Quy mô dân số lớn mang lại lợi thế về nguồn lao động dồi dào và thị trường tiêu thụ rộng lớn.', isTrue: true },
      { id: 'tf5_b', text: 'b) Dân số mỗi năm vẫn tăng thêm nhiều do tỉ lệ gia tăng tự nhiên của nước ta hiện nay rất cao.', isTrue: false },
      { id: 'tf5_c', text: 'c) Sự thay đổi cơ cấu dân số thể hiện ở việc tỉ lệ người dưới 15 tuổi giảm, tỉ lệ người từ 65 tuổi trở lên tăng.', isTrue: true },
      { id: 'tf5_d', text: 'd) Nước ta hiện nay đã bước vào thời kì "dân số già".', isTrue: false }
    ]
  },
  {
    id: 'tf6',
    type: 'true_false',
    text: 'Về vùng Trung du và miền núi phía Bắc: "Đây là vùng có diện tích lớn nhất nước ta, có nhiều thế mạnh về tự nhiên để phát triển kinh tế, đặc biệt là công nghiệp khai khoáng và thủy điện."',
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Khai thác thế mạnh ở Trung du và miền núi phía Bắc',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf6_a', text: 'a) Vùng này giàu tài nguyên khoáng sản nhất cả nước, nổi bật là than đá ở Quảng Ninh.', isTrue: true },
      { id: 'tf6_b', text: 'b) Trữ năng thủy điện của vùng tập trung chủ yếu trên hệ thống sông Thái Bình.', isTrue: false },
      { id: 'tf6_c', text: 'c) Khí hậu nhiệt đới ẩm gió mùa có mùa đông lạnh giúp vùng phát triển các loại cây cận nhiệt và ôn đới.', isTrue: true },
      { id: 'tf6_d', text: 'd) Địa hình đồi núi hiểm trở là thuận lợi lớn nhất để phát triển giao thông vận tải của vùng.', isTrue: false }
    ]
  },
  {
    id: 'tf7',
    type: 'true_false',
    text: 'Đọc đoạn thông tin về giao thông vận tải: "Giao thông vận tải đường bộ nước ta đã được đầu tư nâng cấp và mở rộng, đóng vai trò quan trọng nhất trong việc vận chuyển hàng hóa và hành khách."',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf7_a', text: 'a) Đường bộ có khối lượng vận chuyển hàng hóa lớn nhất do tính cơ động cao, thích ứng với nhiều dạng địa hình.', isTrue: true },
      { id: 'tf7_b', text: 'b) Tuyến đường bộ quan trọng nhất nối liền Bắc - Nam là đường Hồ Chí Minh.', isTrue: false },
      { id: 'tf7_c', text: 'c) Mạng lưới đường bộ nước ta đã phủ kín các vùng miền, kể cả vùng núi và biên giới.', isTrue: true },
      { id: 'tf7_d', text: 'd) Đường bộ là loại hình vận tải có cước phí rẻ nhất trên những tuyến đường dài.', isTrue: false }
    ]
  },
  {
    id: 'tf8',
    type: 'true_false',
    text: 'Về định hướng phát triển bền vững ở nước ta: "Để giải quyết hài hòa mối quan hệ giữa tăng trưởng kinh tế và bảo vệ môi trường, nước ta đang đẩy mạnh chuyển đổi mô hình tăng trưởng."',
    topic: 'Địa lí tự nhiên',
    lesson: 'Vấn đề sử dụng hợp lí tài nguyên thiên nhiên và bảo vệ môi trường',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf8_a', text: 'a) Phát triển kinh tế tuần hoàn là một giải pháp quan trọng giúp giảm thiểu rác thải và sử dụng hiệu quả tài nguyên.', isTrue: true },
      { id: 'tf8_b', text: 'b) Tăng trưởng xanh chỉ tập trung vào việc trồng thêm nhiều cây xanh ở các khu đô thị.', isTrue: false },
      { id: 'tf8_c', text: 'c) Việc cam kết đạt mức phát thải ròng bằng "0" (Net Zero) vào năm 2050 đòi hỏi nước ta phải chuyển đổi mạnh mẽ sang năng lượng sạch.', isTrue: true },
      { id: 'tf8_d', text: 'd) Phát triển bền vững nghĩa là ngừng hoàn toàn việc khai thác tài nguyên thiên nhiên để bảo vệ môi trường.', isTrue: false }
    ]
  },
  {
    id: 'tf9',
    type: 'true_false',
    text: 'Đọc thông tin về ngành công nghiệp: "Cơ cấu ngành công nghiệp nước ta khá đa dạng, trong đó nổi lên một số ngành công nghiệp trọng điểm như công nghiệp năng lượng, công nghiệp chế biến lương thực, thực phẩm."',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf9_a', text: 'a) Ngành công nghiệp trọng điểm là ngành mang lại hiệu quả kinh tế cao và tác động mạnh đến các ngành khác.', isTrue: true },
      { id: 'tf9_b', text: 'b) Công nghiệp chế biến lương thực, thực phẩm phân bố chủ yếu ở vùng núi do gần nguồn nguyên liệu.', isTrue: false },
      { id: 'tf9_c', text: 'c) Công nghiệp điện lực của nước ta dựa chủ yếu vào hai nguồn chính là nhiệt điện và thủy điện.', isTrue: true },
      { id: 'tf9_d', text: 'd) Cơ cấu giá trị sản xuất công nghiệp của nước ta đang chuyển dịch theo hướng tăng tỉ trọng công nghiệp khai thác.', isTrue: false }
    ]
  },
  {
    id: 'tf10',
    type: 'true_false',
    text: 'Về vùng Đông Nam Bộ: "Đông Nam Bộ là vùng dẫn đầu cả nước về GDP, giá trị sản xuất công nghiệp và thu hút vốn đầu tư nước ngoài."',
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đông Nam Bộ',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf10_a', text: 'a) Vùng có lợi thế lớn về vị trí địa lí, nằm gần các tuyến hàng hải quốc tế.', isTrue: true },
      { id: 'tf10_b', text: 'b) Nguồn lao động dồi dào, trình độ chuyên môn kĩ thuật cao là một thế mạnh của vùng.', isTrue: true },
      { id: 'tf10_c', text: 'c) Khó khăn lớn nhất về tự nhiên của vùng là thường xuyên chịu ảnh hưởng của bão và lũ lụt.', isTrue: false },
      { id: 'tf10_d', text: 'd) Vùng này không có khả năng phát triển nông nghiệp do diện tích đất đai hạn hẹp.', isTrue: false }
    ]
  },
  {
    id: 'tf11',
    type: 'true_false',
    text: 'Cho bảng số liệu về Dân số và GDP của một số quốc gia Đông Nam Á năm 2021:\n\n| Quốc gia | Dân số (triệu người) | GDP (tỉ USD) |\n|---|---|---|\n| In-đô-nê-xi-a | 273,8 | 1186,1 |\n| Thái Lan | 71,6 | 505,9 |\n| Ma-lai-xi-a | 33,6 | 373,0 |\n| Việt Nam | 98,5 | 366,1 |\n\n(Nguồn: Niên giám thống kê Việt Nam 2022)\n\nDựa vào bảng số liệu, nhận xét các phát biểu sau:',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Khu vực Đông Nam Á',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf11_a', text: 'a) In-đô-nê-xi-a là quốc gia có quy mô dân số và GDP lớn nhất trong số các quốc gia trên.', isTrue: true },
      { id: 'tf11_b', text: 'b) GDP bình quân đầu người của Thái Lan cao hơn Ma-lai-xi-a.', isTrue: false },
      { id: 'tf11_c', text: 'c) Việt Nam có quy mô dân số đứng thứ hai nhưng GDP thấp nhất trong bảng.', isTrue: true },
      { id: 'tf11_d', text: 'd) Để thể hiện quy mô dân số và GDP của các quốc gia trên năm 2021, biểu đồ tròn là thích hợp nhất.', isTrue: false }
    ]
  },

  // --- PHẦN 3: TRẢ LỜI NGẮN ---
  {
    id: 'sa1',
    type: 'short_answer',
    text: 'Năm 2022, dân số nước ta là 99,5 triệu người, diện tích tự nhiên là 331.344 km2. Tính mật độ dân số nước ta năm 2022 (làm tròn đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    correctAnswer: '300',
    unit: 'người/km2',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'sa2',
    type: 'short_answer',
    text: 'Một địa điểm có nhiệt độ trung bình tháng cao nhất là 28,9°C và nhiệt độ trung bình tháng thấp nhất là 16,4°C. Tính biên độ nhiệt độ trung bình năm của địa điểm đó.',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    correctAnswer: '12.5',
    unit: '°C',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'sa3',
    type: 'short_answer',
    text: 'Năm 2021, sản lượng lúa của nước ta là 43,8 triệu tấn, diện tích gieo trồng lúa là 7,2 triệu ha. Tính năng suất lúa của nước ta năm 2021 (tạ/ha, làm tròn đến 1 chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    correctAnswer: '60.8',
    unit: 'tạ/ha',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa4',
    type: 'short_answer',
    text: 'Năm 2022, tổng giá trị xuất nhập khẩu của nước ta là 730,2 tỉ USD, trong đó giá trị xuất khẩu là 371,3 tỉ USD. Tính cán cân xuất nhập khẩu của nước ta năm 2022 (tỉ USD).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Thương mại và du lịch',
    correctAnswer: '12.4',
    unit: 'tỉ USD',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa5',
    type: 'short_answer',
    text: 'Cho tỉ suất sinh thô là 15‰, tỉ suất tử thô là 6‰. Tính tỉ lệ gia tăng dân số tự nhiên (%).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    correctAnswer: '0.9',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa6',
    type: 'short_answer',
    text: 'Năm 2022, tổng GDP của nước ta là 408,8 tỉ USD, trong đó khu vực Nông, lâm, thủy sản đạt 48,6 tỉ USD. Tính tỉ trọng của khu vực Nông, lâm, thủy sản trong cơ cấu GDP (%, làm tròn đến 1 chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    correctAnswer: '11.9',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa7',
    type: 'short_answer',
    text: 'Năm 2020, sản lượng thủy sản khai thác của nước ta là 3842 nghìn tấn, sản lượng thủy sản nuôi trồng là 4568 nghìn tấn. Tính tỉ trọng sản lượng thủy sản nuôi trồng trong tổng sản lượng thủy sản (%, làm tròn đến 1 chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    correctAnswer: '54.3',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa8',
    type: 'short_answer',
    text: 'Biết rằng cứ lên cao 100m nhiệt độ giảm 0,6°C. Tại chân núi (độ cao 0m) nhiệt độ là 25°C. Tính nhiệt độ tại đỉnh núi có độ cao 2000m.',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    correctAnswer: '13',
    unit: '°C',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa9',
    type: 'short_answer',
    text: 'Năm 2022, dân số thành thị của nước ta là 37,3 triệu người, tổng dân số là 99,5 triệu người. Tính tỉ lệ dân thành thị của nước ta năm 2022 (%, làm tròn đến 1 chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đô thị hoá',
    correctAnswer: '37.5',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa10',
    type: 'short_answer',
    text: 'Năm 2021, diện tích rừng tự nhiên của nước ta là 10,1 triệu ha, diện tích rừng trồng là 4,6 triệu ha. Tính tổng diện tích rừng của nước ta năm 2021 (triệu ha).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề sử dụng hợp lí tài nguyên thiên nhiên và bảo vệ môi trường',
    correctAnswer: '14.7',
    unit: 'triệu ha',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'sa11',
    type: 'short_answer',
    text: 'Dự báo do tác động của biến đổi khí hậu, tổng lượng tài nguyên nước mặt của lưu vực sông Hồng - Thái Bình vào mùa cạn sẽ giảm khoảng 15% so với mức trung bình nhiều năm là 34 tỉ m3. Tính lượng tài nguyên nước mặt của lưu vực này vào mùa cạn theo dự báo trên (tỉ m3, làm tròn đến 1 chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    correctAnswer: '28.9',
    unit: 'tỉ m3',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc35',
    type: 'multiple_choice',
    text: 'Tác động quan trọng nhất của Biển Đông đến khí hậu nước ta là',
    options: [
      'làm tăng độ ẩm của các khối khí qua biển.',
      'giảm bớt tính khắc nghiệt của thời tiết mùa đông.',
      'mang lại lượng mưa lớn cho các vùng ven biển.',
      'làm dịu bớt thời tiết nóng bức trong mùa hè.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên chịu ảnh hưởng sâu sắc của biển',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc36',
    type: 'multiple_choice',
    text: 'Đặc điểm nào sau đây không đúng với quá trình đô thị hóa ở nước ta hiện nay?',
    options: [
      'Trình độ đô thị hóa còn thấp.',
      'Tỉ lệ dân thành thị tăng nhanh.',
      'Phân bố đô thị đồng đều giữa các vùng.',
      'Quá trình đô thị hóa gắn liền với công nghiệp hóa.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí dân cư',
    lesson: 'Đô thị hoá',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc37',
    type: 'multiple_choice',
    text: 'Ngành chăn nuôi lợn ở nước ta tập trung nhiều nhất ở',
    options: [
      'Đồng bằng sông Hồng và Đồng bằng sông Cửu Long.',
      'Trung du và miền núi phía Bắc và Tây Nguyên.',
      'Bắc Trung Bộ và Nam Trung Bộ.',
      'Đông Nam Bộ và Đồng bằng sông Cửu Long.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc38',
    type: 'multiple_choice',
    text: 'Hướng chủ yếu trong việc hoàn thiện cơ cấu ngành công nghiệp nước ta hiện nay là',
    options: [
      'đầu tư phát triển các ngành công nghiệp trọng điểm.',
      'ưu tiên phát triển công nghiệp nặng.',
      'tập trung phát triển công nghiệp khai khoáng.',
      'hạn chế các ngành công nghiệp sử dụng nhiều lao động.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc39',
    type: 'multiple_choice',
    text: 'Loại hình giao thông vận tải có khối lượng luân chuyển hàng hóa lớn nhất nước ta hiện nay là',
    options: [
      'đường biển.',
      'đường bộ.',
      'đường sắt.',
      'đường hàng không.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc40',
    type: 'multiple_choice',
    text: 'Thế mạnh hàng đầu để phát triển công nghiệp ở Trung du và miền núi phía Bắc là',
    options: [
      'khai thác khoáng sản và thủy điện.',
      'chế biến nông, lâm, thủy sản.',
      'sản xuất vật liệu xây dựng.',
      'công nghiệp dệt may, da giày.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Khai thác thế mạnh ở Trung du và miền núi phía Bắc',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc41',
    type: 'multiple_choice',
    text: 'Mục đích chủ yếu của việc chuyển dịch cơ cấu kinh tế ở Đồng bằng sông Hồng là',
    options: [
      'thúc đẩy tăng trưởng kinh tế và giải quyết các vấn đề xã hội, môi trường.',
      'giảm tỉ trọng ngành nông nghiệp, tăng diện tích đất chuyên dùng.',
      'thu hút vốn đầu tư nước ngoài vào các khu công nghiệp.',
      'giải quyết việc làm cho số lượng lao động dồi dào của vùng.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc42',
    type: 'multiple_choice',
    text: 'Việc bảo vệ vốn rừng ở Bắc Trung Bộ có vai trò chủ yếu là',
    options: [
      'bảo vệ môi trường sinh thái, giữ nước ngầm và hạn chế thiên tai.',
      'cung cấp nguyên liệu cho công nghiệp chế biến gỗ.',
      'tạo việc làm và tăng thu nhập cho người dân địa phương.',
      'phát triển mô hình nông - lâm kết hợp.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Bắc Trung Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc43',
    type: 'multiple_choice',
    text: 'Nghề làm muối phát triển mạnh ở Nam Trung Bộ chủ yếu do',
    options: [
      'nhiệt độ cao, nhiều nắng, ít mưa, có ít sông lớn đổ ra biển.',
      'đường bờ biển dài, nhiều vũng vịnh kín gió.',
      'người dân có nhiều kinh nghiệm trong sản xuất muối.',
      'thị trường tiêu thụ muối rộng lớn.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc44',
    type: 'multiple_choice',
    text: 'Giải pháp quan trọng nhất để ứng phó với tình trạng xâm nhập mặn ở Đồng bằng sông Cửu Long là',
    options: [
      'chuyển đổi cơ cấu cây trồng, vật nuôi phù hợp và xây dựng hệ thống thủy lợi.',
      'tăng cường khai thác nước ngầm để phục vụ tưới tiêu.',
      'đắp đê ngăn mặn dọc theo toàn bộ đường bờ biển.',
      'di dân ra khỏi các vùng bị nhiễm mặn nghiêm trọng.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'tf12',
    type: 'true_false',
    text: 'Cho thông tin sau về đặc điểm dân số nước ta: "Nước ta có quy mô dân số đông, cơ cấu dân số đang có sự thay đổi nhanh chóng, tỉ lệ người cao tuổi ngày càng tăng."',
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf12_a', text: 'a) Dân số đông mang lại lợi thế về nguồn lao động dồi dào và thị trường tiêu thụ rộng lớn.', isTrue: true },
      { id: 'tf12_b', text: 'b) Tỉ lệ người cao tuổi tăng cho thấy chất lượng y tế và mức sống của người dân được cải thiện.', isTrue: true },
      { id: 'tf12_c', text: 'c) Cơ cấu dân số già hóa không gây ra áp lực nào đối với hệ thống an sinh xã hội.', isTrue: false },
      { id: 'tf12_d', text: 'd) Hiện nay, tỉ suất gia tăng dân số tự nhiên của nước ta vẫn ở mức rất cao (trên 2%).', isTrue: false }
    ]
  },
  {
    id: 'tf13',
    type: 'true_false',
    text: 'Về định hướng phát triển nông nghiệp ở Đồng bằng sông Cửu Long: "Đồng bằng sông Cửu Long đang chuyển đổi mạnh mẽ cơ cấu sản xuất nông nghiệp để thích ứng với biến đổi khí hậu."',
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf13_a', text: 'a) Việc giảm diện tích trồng lúa, tăng diện tích nuôi trồng thủy sản là một hướng chuyển đổi phù hợp.', isTrue: true },
      { id: 'tf13_b', text: 'b) Vùng cần tập trung phát triển các giống cây trồng, vật nuôi có khả năng chịu mặn, chịu hạn tốt.', isTrue: true },
      { id: 'tf13_c', text: 'c) Giải pháp lâu dài là đắp đê bao triệt để để ngăn hoàn toàn nước lũ vào mùa mưa.', isTrue: false },
      { id: 'tf13_d', text: 'd) Phát triển nông nghiệp sinh thái gắn với du lịch là một trong những định hướng phát triển bền vững của vùng.', isTrue: true }
    ]
  },
  {
    id: 'tf14',
    type: 'true_false',
    text: 'Cho bảng số liệu về giá trị xuất, nhập khẩu của nước ta (Đơn vị: Tỉ USD):\n\n| Năm | 2015 | 2018 | 2021 |\n|---|---|---|---|\n| Xuất khẩu | 162,0 | 243,5 | 336,3 |\n| Nhập khẩu | 165,8 | 236,7 | 332,2 |\n\n(Nguồn: Niên giám thống kê Việt Nam)\n\nDựa vào bảng số liệu, nhận xét các phát biểu sau:',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Thương mại và du lịch',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf14_a', text: 'a) Tổng kim ngạch xuất nhập khẩu của nước ta tăng liên tục qua các năm.', isTrue: true },
      { id: 'tf14_b', text: 'b) Năm 2015, nước ta ở tình trạng xuất siêu.', isTrue: false },
      { id: 'tf14_c', text: 'c) Cán cân xuất nhập khẩu của nước ta đã chuyển từ nhập siêu (2015) sang xuất siêu (2018, 2021).', isTrue: true },
      { id: 'tf14_d', text: 'd) Biểu đồ thích hợp nhất để thể hiện sự chuyển dịch cơ cấu giá trị xuất nhập khẩu là biểu đồ cột ghép.', isTrue: false }
    ]
  },
  {
    id: 'sa12',
    type: 'short_answer',
    text: 'Nhiệt độ trung bình tháng cao nhất tại Hà Nội là 28,9°C (tháng 7), nhiệt độ trung bình tháng thấp nhất là 16,4°C (tháng 1). Tính biên độ nhiệt độ trung bình năm của Hà Nội (°C).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '12.5',
    unit: '°C',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'sa13',
    type: 'short_answer',
    text: 'Năm 2021, sản lượng lúa của nước ta đạt 43,8 triệu tấn, diện tích trồng lúa là 7,2 triệu ha. Tính năng suất lúa của nước ta năm 2021 (tạ/ha, làm tròn đến 1 chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    correctAnswer: '60.8',
    unit: 'tạ/ha',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa14',
    type: 'short_answer',
    text: 'Năm 2021, khối lượng hàng hóa vận chuyển bằng đường bộ là 1285,3 triệu tấn, tổng khối lượng hàng hóa vận chuyển của tất cả các loại hình giao thông là 1625,4 triệu tấn. Tính tỉ trọng khối lượng hàng hóa vận chuyển bằng đường bộ (%, làm tròn đến 1 chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    correctAnswer: '79.1',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa15',
    type: 'short_answer',
    text: 'Năm 2021, khối lượng luân chuyển hàng hóa bằng đường sắt là 2,7 tỉ tấn.km, khối lượng hàng hóa vận chuyển bằng đường sắt là 5,2 triệu tấn. Tính cự li vận chuyển trung bình của đường sắt năm 2021 (km, làm tròn đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    correctAnswer: '519',
    unit: 'km',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc45',
    type: 'multiple_choice',
    text: 'Gió mùa Tây Nam khi thổi vào nước ta gây mưa lớn cho khu vực nào sau đây?',
    options: [
      'Nam Bộ và Tây Nguyên.',
      'Đồng bằng sông Hồng.',
      'Trung du và miền núi phía Bắc.',
      'Bắc Trung Bộ.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc46',
    type: 'multiple_choice',
    text: 'Hậu quả lớn nhất của việc phân bố dân cư chưa hợp lí ở nước ta là',
    options: [
      'khó khăn trong việc sử dụng hợp lí nguồn lao động và khai thác tài nguyên.',
      'gây ô nhiễm môi trường nghiêm trọng ở các đô thị lớn.',
      'làm cạn kiệt tài nguyên thiên nhiên ở vùng đồng bằng.',
      'gây khó khăn cho việc nâng cao chất lượng cuộc sống ở nông thôn.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc47',
    type: 'multiple_choice',
    text: 'Nhân tố chủ yếu quyết định sự phân bố của ngành công nghiệp chế biến lương thực, thực phẩm ở nước ta là',
    options: [
      'nguồn nguyên liệu và thị trường tiêu thụ.',
      'nguồn lao động dồi dào và giá rẻ.',
      'cơ sở hạ tầng và chính sách phát triển.',
      'nguồn vốn đầu tư và công nghệ hiện đại.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc48',
    type: 'multiple_choice',
    text: 'Khó khăn lớn nhất đối với việc phát triển ngành khai thác thủy sản xa bờ ở nước ta hiện nay là',
    options: [
      'thiếu vốn đầu tư cho phương tiện và ngư cụ hiện đại.',
      'nguồn lợi thủy sản ven bờ đang bị suy giảm nghiêm trọng.',
      'thường xuyên chịu ảnh hưởng của bão và áp thấp nhiệt đới.',
      'thị trường tiêu thụ sản phẩm không ổn định.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc49',
    type: 'multiple_choice',
    text: 'Thế mạnh nổi bật để phát triển du lịch biển ở Nam Trung Bộ so với các vùng khác là',
    options: [
      'có nhiều bãi biển đẹp, nước trong xanh, quanh năm đầy nắng.',
      'có nhiều di sản văn hóa thế giới được UNESCO công nhận.',
      'cơ sở hạ tầng du lịch phát triển đồng bộ và hiện đại nhất.',
      'nằm gần các trung tâm kinh tế lớn của cả nước.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc50',
    type: 'multiple_choice',
    text: 'Ý nghĩa chủ yếu của việc phát triển các vùng chuyên canh cây công nghiệp lâu năm ở Nam Trung Bộ (khu vực Tây Nguyên cũ) là',
    options: [
      'tạo ra khối lượng nông sản hàng hóa lớn, thúc đẩy công nghiệp chế biến.',
      'phủ xanh đất trống đồi trọc, bảo vệ môi trường sinh thái.',
      'giải quyết việc làm, nâng cao đời sống cho đồng bào dân tộc thiểu số.',
      'hạn chế tình trạng du canh du cư, phân bố lại dân cư.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc51',
    type: 'multiple_choice',
    text: 'Việc xây dựng các nhà máy thủy điện ở Trung du và miền núi phía Bắc không mang lại ý nghĩa nào sau đây?',
    options: [
      'Cung cấp phù sa màu mỡ cho vùng đồng bằng châu thổ.',
      'Cung cấp nguồn năng lượng lớn cho phát triển kinh tế.',
      'Tạo ra các hồ chứa nước phục vụ thủy lợi và nuôi trồng thủy sản.',
      'Góp phần điều tiết dòng chảy, hạn chế lũ lụt cho hạ lưu.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Khai thác thế mạnh ở Trung du và miền núi phía Bắc',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc52',
    type: 'multiple_choice',
    text: 'Vào mùa khô, khó khăn lớn nhất đối với sản xuất nông nghiệp ở Đồng bằng sông Cửu Long là',
    options: [
      'thiếu nước ngọt trầm trọng và xâm nhập mặn vào sâu trong đất liền.',
      'thủy triều dâng cao làm ngập lụt nhiều diện tích đất canh tác.',
      'đất phèn, đất mặn bốc lên bề mặt làm chết cây trồng.',
      'nguy cơ cháy rừng tràm và rừng ngập mặn tăng cao.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc53',
    type: 'multiple_choice',
    text: 'Đặc điểm nổi bật của địa hình vùng núi Tây Bắc nước ta là',
    options: [
      'địa hình cao nhất nước ta, hướng núi chính là tây bắc - đông nam.',
      'gồm các khối núi và cao nguyên xếp tầng, hướng vòng cung.',
      'địa hình thấp, hẹp ngang, bị chia cắt mạnh bởi các dòng sông.',
      'chủ yếu là đồi núi thấp, hướng núi chính là tây bắc - đông nam.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Đặc điểm chung của tự nhiên',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc54',
    type: 'multiple_choice',
    text: 'Vai trò quan trọng nhất của giao thông vận tải đường biển nước ta hiện nay là',
    options: [
      'đảm đương phần lớn khối lượng luân chuyển hàng hóa xuất nhập khẩu quốc tế.',
      'vận chuyển hành khách và hàng hóa Bắc - Nam với khối lượng lớn.',
      'phục vụ nhu cầu đi lại của người dân giữa các đảo và đất liền.',
      'thúc đẩy sự phát triển kinh tế của các huyện đảo tiền tiêu.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'tf15',
    type: 'true_false',
    text: 'Cho thông tin sau về vị trí địa lí nước ta: "Nước ta nằm ở rìa phía đông của bán đảo Đông Dương, gần trung tâm khu vực Đông Nam Á, nằm hoàn toàn trong vùng nội chí tuyến bán cầu Bắc."',
    topic: 'Địa lí tự nhiên',
    lesson: 'Vị trí địa lí và phạm vi lãnh thổ',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf15_a', text: 'a) Vị trí địa lí quy định thiên nhiên nước ta mang tính chất nhiệt đới ẩm gió mùa.', isTrue: true },
      { id: 'tf15_b', text: 'b) Nước ta nằm ở nơi giao thoa của các vành đai sinh khoáng nên có tài nguyên sinh vật phong phú.', isTrue: false },
      { id: 'tf15_c', text: 'c) Vị trí tiếp giáp với Biển Đông mang lại nguồn nhiệt ẩm dồi dào, lượng mưa lớn.', isTrue: true },
      { id: 'tf15_d', text: 'd) Nước ta nằm hoàn toàn trong vùng xích đạo nên khí hậu nóng quanh năm, không có mùa đông lạnh.', isTrue: false }
    ]
  },
  {
    id: 'tf16',
    type: 'true_false',
    text: 'Về phát triển kinh tế biển ở Nam Trung Bộ: "Nam Trung Bộ có đường bờ biển dài, nhiều vũng vịnh sâu, vùng biển rộng lớn với nguồn lợi hải sản phong phú, tạo điều kiện thuận lợi để phát triển tổng hợp kinh tế biển."',
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf16_a', text: 'a) Vùng có nhiều điều kiện thuận lợi để xây dựng các cảng biển nước sâu, phục vụ giao thương quốc tế.', isTrue: true },
      { id: 'tf16_b', text: 'b) Hoạt động khai thác dầu khí là ngành kinh tế biển mũi nhọn, đóng góp lớn nhất vào GDP của vùng.', isTrue: false },
      { id: 'tf16_c', text: 'c) Nghề làm muối phát triển mạnh do khí hậu nhiệt đới, ít mưa, nhiều nắng và ít sông lớn đổ ra biển.', isTrue: true },
      { id: 'tf16_d', text: 'd) Du lịch biển đảo là một thế mạnh lớn, tuy nhiên vùng chưa có các trung tâm du lịch mang tầm cỡ quốc gia.', isTrue: false }
    ]
  },
  {
    id: 'tf17',
    type: 'true_false',
    text: 'Cho thông tin về chuyển dịch cơ cấu kinh tế: "Cơ cấu kinh tế nước ta đang có sự chuyển dịch tích cực theo hướng công nghiệp hóa, hiện đại hóa, phù hợp với xu hướng hội nhập kinh tế quốc tế."',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf17_a', text: 'a) Trong cơ cấu ngành kinh tế, tỉ trọng ngành nông, lâm, thủy sản giảm dần, tỉ trọng ngành công nghiệp và xây dựng tăng lên.', isTrue: true },
      { id: 'tf17_b', text: 'b) Trong cơ cấu thành phần kinh tế, khu vực kinh tế Nhà nước đang giảm dần vai trò chủ đạo trong nền kinh tế.', isTrue: false },
      { id: 'tf17_c', text: 'c) Chuyển dịch cơ cấu lãnh thổ kinh tế được thể hiện qua việc hình thành các vùng động lực phát triển kinh tế, các khu công nghiệp tập trung.', isTrue: true },
      { id: 'tf17_d', text: 'd) Sự chuyển dịch cơ cấu kinh tế nước ta hiện nay diễn ra với tốc độ rất nhanh và đã hoàn thành mục tiêu công nghiệp hóa.', isTrue: false }
    ]
  },
  {
    id: 'tf18',
    type: 'true_false',
    text: 'Cho bảng số liệu về Lượng mưa và Lượng bốc hơi của một số địa điểm (Đơn vị: mm):\n\n| Địa điểm | Lượng mưa | Lượng bốc hơi |\n|---|---|---|\n| Hà Nội | 1676 | 989 |\n| Huế | 2868 | 1000 |\n| TP. Hồ Chí Minh | 1931 | 1686 |\n\n(Nguồn: Niên giám thống kê Việt Nam)\n\nDựa vào bảng số liệu, nhận xét các phát biểu sau:',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf18_a', text: 'a) Huế là địa điểm có lượng mưa lớn nhất trong ba địa điểm trên.', isTrue: true },
      { id: 'tf18_b', text: 'b) Cân bằng ẩm (Lượng mưa - Lượng bốc hơi) của Hà Nội cao hơn TP. Hồ Chí Minh.', isTrue: true },
      { id: 'tf18_c', text: 'c) Cả ba địa điểm đều có lượng bốc hơi lớn hơn lượng mưa, thể hiện tính chất khô hạn.', isTrue: false },
      { id: 'tf18_d', text: 'd) Để thể hiện lượng mưa và lượng bốc hơi của các địa điểm trên, biểu đồ đường là thích hợp nhất.', isTrue: false }
    ]
  },
  {
    id: 'sa16',
    type: 'short_answer',
    text: 'Năm 2021, dân số nước ta là 98,5 triệu người, diện tích tự nhiên là 331,3 nghìn km2. Tính mật độ dân số nước ta năm 2021 (người/km2, làm tròn đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    correctAnswer: '297',
    unit: 'người/km2',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa17',
    type: 'short_answer',
    text: 'Năm 2021, tổng giá trị xuất nhập khẩu của nước ta là 668,5 tỉ USD, trong đó giá trị xuất khẩu là 336,3 tỉ USD. Tính tỉ trọng giá trị xuất khẩu trong tổng kim ngạch xuất nhập khẩu (%, làm tròn đến 1 chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Thương mại và du lịch',
    correctAnswer: '50.3',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa18',
    type: 'short_answer',
    text: 'Năm 2021, sản lượng thủy sản khai thác của nước ta là 3,9 triệu tấn, sản lượng thủy sản nuôi trồng là 4,9 triệu tấn. Tính tỉ trọng sản lượng thủy sản nuôi trồng trong tổng sản lượng thủy sản (%, làm tròn đến 1 chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    correctAnswer: '55.7',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa19',
    type: 'short_answer',
    text: 'Năm 2021, tổng sản phẩm trong nước (GDP) của nước ta theo giá hiện hành là 8398,6 nghìn tỉ đồng, dân số trung bình là 98,5 triệu người. Tính GDP bình quân đầu người của nước ta năm 2021 (triệu đồng/người, làm tròn đến 1 chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    correctAnswer: '85.3',
    unit: 'triệu đồng',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa20',
    type: 'short_answer',
    text: 'Nhiệt độ trung bình tháng 1 tại trạm khí tượng Lạng Sơn là 13,3°C, tại trạm khí tượng Cà Mau là 25,8°C. Tính chênh lệch nhiệt độ trung bình tháng 1 giữa Cà Mau và Lạng Sơn (°C, làm tròn đến 1 chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '12.5',
    unit: '°C',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc55',
    type: 'multiple_choice',
    text: 'Cho biểu đồ cơ cấu trang trại phân theo lĩnh vực hoạt động ở nước ta giai đoạn 2011 - 2024. Nhận xét nào sau đây đúng về cơ cấu trang trại phân theo lĩnh vực hoạt động ở nước ta, giai đoạn 2010 – 2024?',
    options: [
      'Giai đoạn 2010 – 2024, trang trại chăn nuôi luôn có tỉ trọng cao nhất.',
      'Tỉ trọng trang trại nuôi trồng thủy sản giảm nhiều hơn trang trại khác.',
      'Tỉ lệ trang trại trồng trọt giảm liên tục trong suốt giai đoạn 2010 – 2024.',
      'Tỉ trọng trang trại trồng trọt giảm 14,4%, trang trại chăn nuôi giảm 25,1%.'
    ],
    correctAnswerIndex: 1,
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc56',
    type: 'multiple_choice',
    text: 'Thiên tai nào sau đây thường xảy ra ở vùng ven biển nước ta khi có bão?',
    options: [
      'Lũ quét.',
      'Ngập mặn.',
      'Sóng thần.',
      'Lũ nguồn.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên tai và biện pháp phòng chống',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc57',
    type: 'multiple_choice',
    text: 'Mạng viễn thông nào sau đây thuộc nhóm mạng truyền dẫn ở nước ta hiện nay?',
    options: [
      'Mạng cáp quang biển.',
      'Mạng điện thoại di động.',
      'Mạng điện thoại cố định.',
      'Mạng truyền hình cáp.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc58',
    type: 'multiple_choice',
    text: 'Khu vực có điều kiện tự nhiên phù hợp để trồng cây dược liệu quý ở Trung du và miền núi phía Bắc là',
    options: [
      'vùng đồi trung du.',
      'các cao nguyên đá vôi.',
      'vùng núi giáp biên giới.',
      'các đồng bằng giữa núi.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Khai thác thế mạnh ở Trung du và miền núi phía Bắc',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc59',
    type: 'multiple_choice',
    text: 'Giao thông vận tải đường thuỷ nội địa ở nước ta hiện nay',
    options: [
      'phân bố chủ yếu ở các vùng đồng bằng.',
      'phân bố đồng đều trên phạm vi cả nước.',
      'phát triển mạnh nhất ở khu vực miền núi.',
      'đảm nhận phần lớn vận chuyển hành khách.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc60',
    type: 'multiple_choice',
    text: 'Nam Trung Bộ hiện nay có thế mạnh để',
    options: [
      'xây dựng và phát triển cảng biển.',
      'khai thác du lịch đồng bằng châu thổ.',
      'mở rộng giao thông đường sông nội địa.',
      'phát triển giao thông đường sắt xuyên núi.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc61',
    type: 'multiple_choice',
    text: 'Vị trí địa lí nước ta',
    options: [
      'nằm trọn vẹn trong vành đai ôn hòa.',
      'hoàn toàn nằm ở vùng nội chí tuyến.',
      'toàn bộ nằm trong vùng cận xích đạo.',
      'có tất cả các phía đều giáp Biển Đông.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí tự nhiên',
    lesson: 'Vị trí địa lí và phạm vi lãnh thổ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc62',
    type: 'multiple_choice',
    text: 'Tính chất nhiệt đới ẩm gió mùa của thiên nhiên nước ta biểu hiện qua đặc điểm nào sau đây?',
    options: [
      'Thực vật lá kim phát triển mạnh.',
      'Động vật xứ lạnh chiếm ưu thế.',
      'Sinh vật nhiệt đới chiếm tỉ lệ cao.',
      'Sinh vật ôn đới phân bố phổ biến.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc63',
    type: 'multiple_choice',
    text: 'Sản lượng và chất lượng thủy sản nuôi trồng ở nước ta tăng nhanh chủ yếu do',
    options: [
      'tập trung khai thác ở vùng ven biển.',
      'áp dụng các mô hình nuôi tiên tiến.',
      'mở rộng diện tích mặt nước nuôi trồng.',
      'tăng cường đánh bắt thủy sản xa bờ.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc64',
    type: 'multiple_choice',
    text: 'Hoạt động logistics phát triển mạnh ở Đồng bằng sông Hồng chủ yếu do',
    options: [
      'thương mại phát triển sớm, số lượng doanh nghiệp nhiều, nguồn vốn đầu tư tăng nhanh.',
      'công nghiệp tăng trưởng nhanh, nhiều khu công nghiệp tập trung, khối lượng hàng hóa lớn.',
      'dân số tập trung đông, nhu cầu tiêu dùng cao, quy mô thị trường nội địa ngày càng mở rộng.',
      'hệ thống giao thông hiện đại, nhiều trung tâm kinh tế lớn, khả năng kết nối quốc tế thuận lợi.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc65',
    type: 'multiple_choice',
    text: 'Biểu hiện rõ nhất của chuyển dịch cơ cấu lãnh thổ kinh tế ở nước ta là',
    options: [
      'phân bố sản xuất không theo lãnh thổ.',
      'hình thành các vùng kinh tế trọng điểm.',
      'thu hẹp quy mô sản xuất các địa phương.',
      'giảm vai trò của các khu công nghệ cao.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc66',
    type: 'multiple_choice',
    text: 'Giải pháp quan trọng đang được Nam Trung Bộ chú trọng trong khai thác khoáng sản hiện nay là',
    options: [
      'Giảm đầu tư vào khâu chế biến sâu.',
      'Tăng cường khai thác với quy mô nhỏ.',
      'Ứng dụng khoa học công nghệ hiện đại.',
      'Phát triển các ngành thủ công truyền thống.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc67',
    type: 'multiple_choice',
    text: 'Quy mô dân số nước ta hiện nay có đặc điểm nào sau đây?',
    options: [
      'Dân số giảm nhanh, quy mô dân số ngày càng thu hẹp.',
      'Dân số không ổn định, biến động mạnh giữa các năm gần đây.',
      'Dân số đông, thuộc nhóm các quốc gia đông dân trong khu vực.',
      'Dân số ít, thuộc nhóm các quốc gia có dân số thấp trong khu vực.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc68',
    type: 'multiple_choice',
    text: 'Chất lượng nguồn lao động của nước ta hiện nay có đặc điểm nào sau đây?',
    options: [
      'Có trình độ cao so với thế giới.',
      'Đã đáp ứng tốt yêu cầu hội nhập.',
      'Có ít kinh nghiệm trong trồng trọt.',
      'Có tỉ lệ lao động qua đào tạo thấp.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc69',
    type: 'multiple_choice',
    text: 'Ngành công nghiệp sản xuất, chế biến thực phẩm của nước ta phát triển chủ yếu dựa vào',
    options: [
      'nguồn nguyên liệu tại chỗ phong phú.',
      'cơ sở vật chất kĩ thuật được nâng cấp.',
      'mạng lưới giao thông vận tải rộng khắp.',
      'vị trí nằm gần các trung tâm công nghiệp.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc70',
    type: 'multiple_choice',
    text: 'Sự phân hóa đa dạng của thiên nhiên nước ta đã tạo ra',
    options: [
      'nhiều vùng kinh tế trọng điểm, các miền địa lí tự nhiên.',
      'cấu trúc địa hình đa dạng, nhiều sản phẩm nông nghiệp.',
      'sự phân hóa về dân cư, thế mạnh khác nhau giữa các vùng.',
      'Các vùng sản xuất quy mô lớn, nhiều sản phẩm đặc trưng.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc71',
    type: 'multiple_choice',
    text: 'Đông Nam Bộ trở thành vùng chuyên canh cây công nghiệp lâu năm lớn của cả nước chủ yếu do thuận lợi nào sau đây?',
    options: [
      'Khí hậu nóng ẩm quanh năm, ít chịu tác động trực tiếp của bão nhiệt đới.',
      'Đất ba-dan và đất xám phù sa cổ phân bố rộng, khí hậu cận xích đạo ổn định.',
      'Dân cư đông đúc, có kinh nghiệm lâu năm trong sản xuất nông nghiệp hàng hóa.',
      'Địa hình tương đối bằng phẳng trên diện rộng, nguồn nước mặt phân bố khá đều.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đông Nam Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc72',
    type: 'multiple_choice',
    text: 'Các cây trồng nào sau đây ở nước ta là cây ăn quả?',
    options: [
      'Chuối, sầu riêng.',
      'Cà phê, ngô.',
      'Dừa, vải thiều.',
      'Quýt, thuốc lá.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'tf19',
    type: 'true_false',
    text: 'Cho thông tin sau:\nĐồng bằng sông Cửu Long là một trong những vùng kinh tế ở nước ta chịu ảnh hưởng nặng nề của biến đổi khí hậu như: lũ lụt, hạn hán, xâm nhập mặn, triều cường, nước biển dâng, sạt lở bờ sông, sạt lở các khu vực ven biển và các rủi ro khác liên quan đến biến đổi khí hậu.',
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf19_a', text: 'a) Đồng bằng sông Cửu Long chịu tác động mạnh của xâm nhập mặn, triều cường và nước biển dâng.', isTrue: true },
      { id: 'tf19_b', text: 'b) Chuyển dịch cơ cấu nông nghiệp theo hướng thích ứng với hạn hán, ngập mặn là giải pháp trực tiếp làm giảm các tác nhân gây ra biến đổi khí hậu trong vùng.', isTrue: false },
      { id: 'tf19_c', text: 'c) Đẩy mạnh trồng rừng và tăng cường hợp tác quốc tế chủ yếu nhằm nâng cao năng lực sản xuất nông nghiệp, hạn chế thiệt hại do thiên tai gây ra.', isTrue: false },
      { id: 'tf19_d', text: 'd) Phát triển các mô hình sinh kế thông minh, nâng cao nhận thức cộng đồng và thay đổi tập quán sản xuất góp phần vừa phát triển kinh tế vừa thích ứng với biến đổi khí hậu.', isTrue: true }
    ]
  },
  {
    id: 'tf20',
    type: 'true_false',
    text: 'Cho thông tin sau:\nViệt Nam đã hình thành hệ thống tổ chức lãnh thổ công nghiệp đa dạng gắn liền với quá trình hiện công nghiệp hóa, đại hóa đất nước. Các khu công nghiệp tập trung đông đảo lao động và vốn đầu tư, phân bố chủ yếu ở Đông Nam Bộ và Đồng bằng sông Hồng, đồng thời đang chuyển dịch sang mô hình sinh thái và số hóa. Khu công nghệ cao đóng vai trò là động lực tăng trưởng dựa trên nghiên cứu và ứng dụng công nghệ hiện đại.',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Tổ chức lãnh thổ công nghiệp',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf20_a', text: 'a) Khu công nghệ cao là nơi tập trung liên kết giữa hoạt động nghiên cứu, phát triển với việc ứng dụng công nghệ hiện đại vào sản xuất.', isTrue: true },
      { id: 'tf20_b', text: 'b) Các khu công nghiệp đang hoạt động có sự phân bố đồng đều giữa các vùng kinh tế nhằm mục đích giải quyết việc làm tại chỗ.', isTrue: false },
      { id: 'tf20_c', text: 'c) Khu công nghiệp sinh thái và mô hình số hóa là xu hướng chuyển dịch của tổ chức lãnh thổ công nghiệp dưới tác động của công nghệ hiện đại.', isTrue: true },
      { id: 'tf20_d', text: 'd) Việc tập trung các khu công nghiệp tại vùng Đông Nam Bộ đã trực tiếp gây ra sự sụt giảm về tổng vốn đầu tư nước ngoài vào nước ta.', isTrue: false }
    ]
  },
  {
    id: 'tf21',
    type: 'true_false',
    text: 'Cho thông tin sau:\nThiên nhiên nhiệt đới ẩm gió mùa đã tạo điều kiện cho sinh vật nước ta phát triển phong phú và đa dạng. Rừng nhiệt đới ẩm lá rộng thường xanh chiếm ưu thế, với nhiều loài cây gỗ quý, động vật nhiệt đới phong phú. Tính đa dạng sinh học cao, thể hiện ở số lượng loài thực vật và động vật lớn, nhiều hệ sinh thái đặc trưng.',
    topic: 'Địa lí tự nhiên',
    lesson: 'Đặc điểm chung của tự nhiên',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf21_a', text: 'a) Hệ sinh thái rừng chủ yếu ở nước ta là rừng nhiệt đới ẩm lá rộng thường xanh, có nhiều loài cây gỗ quý.', isTrue: true },
      { id: 'tf21_b', text: 'b) Việt Nam được đánh giá là một trong những trung tâm đa dạng sinh học cao của thế giới với sự góp mặt của nhiều luồng sinh vật và các loài đặc hữu quý hiếm.', isTrue: true },
      { id: 'tf21_c', text: 'c) Nhiều loài sinh vật bị suy giảm nhanh chóng chủ yếu do tác động của biến đổi khí hậu.', isTrue: false },
      { id: 'tf21_d', text: 'd) Nguyên nhân làm sinh vật nước ta phong phú, đa dạng là do khí hậu nóng ẩm, lượng mưa lớn quanh năm.', isTrue: false }
    ]
  },
  {
    id: 'tf22',
    type: 'true_false',
    text: 'Cho biểu đồ về Tổng sản phẩm trong nước theo giá hiện hành và dân số của một số quốc gia Đông Nam Á năm 2024. Nhận xét các phát biểu sau:',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Khu vực Đông Nam Á',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf22_a', text: 'a) Tổng sản phẩm trong nước của Việt Nam thấp hơn Ma-lai-xi-a.', isTrue: false },
      { id: 'tf22_b', text: 'b) Quy mô dân số của Phi-lip-pin cao gấp khoảng 1,1 lần so với Việt Nam.', isTrue: true },
      { id: 'tf22_c', text: 'c) Xin-ga-po là nước có tổng sản phẩm trong nước cao nhất, dân số thấp nhất.', isTrue: true },
      { id: 'tf22_d', text: 'd) Tổng sản phẩm trong nước bình quân đầu người của Phi-lip-pin cao hơn Ma-lai-xi-a.', isTrue: false }
    ]
  },
  {
    id: 'sa21',
    type: 'short_answer',
    text: 'Năm 2024, dân số Việt Nam là 101,3 triệu người, số dân thành thị là 39,0 triệu người. Hãy cho biết tỉ lệ dân nông thôn trong tổng số dân nước ta là bao nhiêu % (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    correctAnswer: '61.5',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa22',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Trị giá xuất khẩu và nhập khẩu hàng hoá của nước ta giai đoạn 2010 – 2024 (tỉ USD).\n\n| Năm | 2010 | 2024 |\n|---|---|---|\n| Xuất khẩu | 72,2 | 405,9 |\n| Nhập khẩu | 84,8 | 380,9 |\n\nCăn cứ vào bảng số liệu, cho biết từ năm 2010 đến năm 2024, trị giá xuất khẩu tăng thêm cao hơn trị giá nhập khẩu tăng thêm của nước ta bao nhiêu tỉ USD.',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Thương mại và du lịch',
    correctAnswer: '37.6',
    unit: 'tỉ USD',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa23',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Nhiệt độ không khí trung bình các tháng trong năm tại trạm Lai Châu, năm 2024 (°C).\n\n| Tháng | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n| Nhiệt độ | 13,2 | 16,6 | 19,1 | 22,9 | 24,6 | 24,3 | 24,3 | 23,4 | 23,6 | 21,6 | 18,5 | 16,3 |\n\nHãy cho biết nhiệt độ không khí trung bình năm 2024 tại Lai Châu là bao nhiêu °C (làm tròn đến 1 chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '20.7',
    unit: '°C',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa24',
    type: 'short_answer',
    text: 'Năm 2024, diện tích cây cao su của cả nước là 909,3 nghìn ha, trong đó diện tích cây cao su vùng Đông Nam Bộ chiếm 64,0%. Cho biết diện tích cây cao su vùng Đông Nam Bộ năm 2024 là bao nhiêu nghìn ha? (làm tròn kết quả đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Phát triển kinh tế - xã hội ở Đông Nam Bộ',
    correctAnswer: '582',
    unit: 'nghìn ha',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa25',
    type: 'short_answer',
    text: 'Năm 2024, sản lượng điện nước ta đạt 293126 triệu kWh, số dân là 101,3 triệu người. Hãy cho biết sản lượng điện bình quân đầu người của nước ta năm 2024 là bao nhiêu kWh/người. (làm tròn kết quả đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển công nghiệp',
    correctAnswer: '2894',
    unit: 'kWh/người',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa26',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Lượng mưa các tháng trong năm tại hai trạm khí tượng, năm 2024 (mm).\n\n| Trạm | Lượng mưa cao nhất | Lượng mưa thấp nhất |\n|---|---|---|\n| Nam Định | 831,8 (tháng 9) | 3,7 (tháng 12) |\n| Đà Nẵng | 681,7 (tháng 10) | 0,9 (tháng 3) |\n\nHãy cho biết năm 2024, sự chênh lệch lượng mưa cao nhất và lượng mưa thấp nhất của Đà Nẵng thấp hơn so với sự chênh lệch lượng mưa cao nhất và lượng mưa thấp nhất của Nam Định là bao nhiêu lần (làm tròn kết quả đến chữ số thập phân thứ hai).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '1.22',
    unit: 'lần',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc73',
    type: 'multiple_choice',
    text: 'Cho biểu đồ cơ cấu GDP của nước ta phân theo khu vực kinh tế, giai đoạn 2010 - 2023. Nhận xét nào sau đây đúng về cơ cấu GDP của nước ta phân theo khu vực kinh tế, giai đoạn 2010 – 2023?',
    options: [
      'Khu vực công nghiệp, xây dựng luôn có tỉ trọng cao nhất.',
      'Khu vực nông nghiệp, lâm nghiệp, thủy sản có tỉ trọng tăng.',
      'Tỉ trọng khu vực công nghiệp, xây dựng tăng nhiều hơn dịch vụ.',
      'Tỉ trọng khu vực thuế sản phẩm trừ trợ cấp sản phẩm tăng 2,6%.'
    ],
    correctAnswerIndex: 2,
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc74',
    type: 'multiple_choice',
    text: 'Thiên tai chủ yếu thường xảy ra trong mùa khô ở khu vực miền núi nước ta là',
    options: [
      'hạn hán.',
      'sạt lở đất.',
      'lũ quét.',
      'xâm nhập mặn.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên tai và biện pháp phòng chống',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc75',
    type: 'multiple_choice',
    text: 'Hệ thống nào sau đây góp phần giúp mạng viễn thông nước ta hội nhập quốc tế?',
    options: [
      'Mạng điện thoại nội hạt.',
      'Hệ thống cáp quang biển.',
      'Mạng phát thanh địa phương.',
      'Dịch vụ bưu chính truyền thống.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc76',
    type: 'multiple_choice',
    text: 'Đặc điểm nào sau đây đúng về phạm vi lãnh thổ của Đồng bằng sông Cửu Long?',
    options: [
      'Không có đảo ven biển và hải đảo.',
      'Chỉ gồm các tỉnh ven biển phía Nam.',
      'Vùng biển rộng, nhiều đảo và quần đảo.',
      'Không có thành phố trực thuộc Trung ương.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc77',
    type: 'multiple_choice',
    text: 'Giao thông vận tải đường bộ ở nước ta hiện nay',
    options: [
      'phát triển nhanh về vận chuyển và luân chuyển.',
      'chỉ tăng về vận chuyển, chưa tăng luân chuyển.',
      'gặp nhiều hạn chế do thiếu đầu tư cơ sở hạ tầng.',
      'giảm vai trò do cạnh tranh với các loại hình khác.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc78',
    type: 'multiple_choice',
    text: 'Vùng Nam Trung Bộ hiện nay có thế mạnh để',
    options: [
      'chuyên canh cây lúa nước.',
      'phát triển khai thác thủy sản.',
      'khai thác than đá quy mô lớn.',
      'trồng cây công nghiệp ôn đới.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc79',
    type: 'multiple_choice',
    text: 'Vùng biển của nước ta có đặc điểm nào sau đây?',
    options: [
      'Có diện tích nhỏ hơn so với vùng đất.',
      'Bao gồm các đảo nằm ở sát đất liền.',
      'Tiếp giáp với vùng biển của Cam-pu-chia.',
      'Nằm hoàn toàn trong vùng ôn đới gió mùa.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí tự nhiên',
    lesson: 'Vị trí địa lí và phạm vi lãnh thổ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc80',
    type: 'multiple_choice',
    text: 'Tính chất nhiệt đới ẩm gió mùa của thiên nhiên nước ta biểu hiện qua đặc điểm nào sau đây của đất?',
    options: [
      'Quá trình rửa trôi các chất ba-dơ dễ tan diễn ra mạnh.',
      'Quá trình tích tụ mùn diễn ra mạnh mẽ ở vùng đồi núi.',
      'Quá trình tích tụ xác hữu cơ diễn ra nhanh hơn phân hủy.',
      'Quá trình bồi tụ phù sa là quá trình hình thành đất chủ đạo.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc81',
    type: 'multiple_choice',
    text: 'Nuôi trồng thủy sản ở nước ta hiện nay',
    options: [
      'chỉ tập trung các loài tôm và rong biển.',
      'đẩy mạnh áp dụng truy xuất nguồn gốc.',
      'sử dụng duy nhất mô hình nuôi sinh thái.',
      'có sản lượng thấp hơn khai thác thủy sản.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc82',
    type: 'multiple_choice',
    text: 'Các ngành công nghiệp có hàm lượng khoa học – công nghệ ngày càng chiếm tỉ trọng cao ở Đồng bằng sông Hồng chủ yếu do',
    options: [
      'thu hút đầu tư mạnh, hạ tầng hiện đại, nguồn lao động trình độ cao.',
      'lao động trẻ dồi dào, cơ sở hạ tầng hoàn thiện, dịch vụ hỗ trợ đa dạng.',
      'mạng lưới đô thị dày đặc, vốn đầu tư lớn, thị trường tiêu thụ tại chỗ rộng.',
      'truyền thống sản xuất lâu đời, tài nguyên phong phú, vị trí địa lí thuận lợi.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc83',
    type: 'multiple_choice',
    text: 'Cơ cấu kinh tế theo ngành ở nước ta hiện nay chuyển dịch theo hướng',
    options: [
      'chỉ tập trung phát triển các ngành khai khoáng.',
      'tăng tỉ trọng nhóm ngành công nghiệp và dịch vụ.',
      'loại bỏ hoàn toàn ngành nông nghiệp truyền thống.',
      'giảm tỉ trọng của các ngành công nghiệp, xây dựng.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc84',
    type: 'multiple_choice',
    text: 'Nhà máy điện nào sau đây thuộc loại hình năng lượng tái tạo ở vùng Nam Trung Bộ?',
    options: [
      'Ialy.',
      'Sê San 3.',
      'Sông Hinh.',
      'Phong Điện 1.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc85',
    type: 'multiple_choice',
    text: 'Cơ cấu dân số theo dân tộc của nước ta hiện nay có đặc điểm nào sau đây?',
    options: [
      'Dân tộc Kinh chiếm tỉ trọng lớn nhất trong dân số.',
      'Các dân tộc sinh sống hoàn toàn tách biệt với nhau.',
      'Các dân tộc thiểu số chiếm tỉ lệ đa số trong dân cư.',
      'Chỉ có dân tộc Kinh tham gia vào hội nhập quốc tế.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc86',
    type: 'multiple_choice',
    text: 'Nguồn lao động của nước ta hiện nay có đặc điểm nào sau đây?',
    options: [
      'Tỉ lệ làm việc ở khu vực nhà nước tăng.',
      'Không còn kinh nghiệm sản xuất thủ công.',
      'Chuyển dịch tích cực giữa các ngành kinh tế.',
      'Lao động ngành nông nghiệp tăng rất nhanh.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc87',
    type: 'multiple_choice',
    text: 'Sản phẩm công nghiệp nào sau đây thuộc ngành công nghiệp sản xuất, chế biến thực phẩm và sản xuất đồ uống của nước ta?',
    options: [
      'Quần áo.',
      'Gạo xay xát.',
      'Giày, dép da.',
      'Sản xuất sợi.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc88',
    type: 'multiple_choice',
    text: 'Sự phân hóa đa dạng của các điều kiện tự nhiên giữa các vùng miền ở nước ta là cơ sở chủ yếu để',
    options: [
      'phân bố lại dân cư và lao động đồng đều giữa các vùng.',
      'xóa bỏ hoàn toàn các khó khăn về thiên tai trong sản xuất.',
      'hình thành các vùng sản xuất với những sản phẩm đặc trưng.',
      'khai thác tối đa nguồn khoáng sản có trữ lượng nhỏ ở vùng núi.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc89',
    type: 'multiple_choice',
    text: 'Đông Nam Bộ có điều kiện thuận lợi chủ yếu nào sau đây để trở thành đầu mối giao thông vận tải lớn nhất cả nước?',
    options: [
      'Vị trí địa lí thuận lợi, kinh tế phát triển năng động hàng đầu.',
      'Địa hình bằng phẳng, mạng lưới sông ngòi dày đặc khắp nơi.',
      'Có nhiều cửa khẩu quốc tế, địa hình bán bình nguyên ổn định.',
      'Khí hậu có hai mùa mưa khô, hệ thống cảng biển nước sâu lớn.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đông Nam Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc90',
    type: 'multiple_choice',
    text: 'Các cây trồng nào sau đây ở nước ta là cây lương thực?',
    options: [
      'Cà phê, chè.',
      'Lúa gạo, ngô.',
      'Cao su, hồ tiêu.',
      'Cây điều, thuốc lá.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'tf23',
    type: 'true_false',
    text: 'Cho thông tin sau:\nTrung du và miền núi phía Bắc gồm 9 tỉnh có vị trí chiến lược tiếp giáp Trung Quốc, Lào nhưng không giáp biển. Đây là vùng dân cư đa sắc tộc có mật độ thấp hơn mức trung bình cả nước nhưng sở hữu nguồn tài nguyên khoáng sản phong phú nhất Việt Nam. Về nông nghiệp, vùng khẳng định vị thế số 1 cả nước về cây chè, chiếm hơn 80% diện tích cả nước và phát triển mạnh các loại cây dược liệu, cây ăn quả. Ngành chăn nuôi gia súc lớn là thế mạnh đặc trưng với đàn trâu chiếm gần 60% tổng đàn cả nước vào năm 2024. Riêng tỉnh Sơn La đóng vai trò là trung tâm chăn nuôi của vùng với đàn bò thịt lớn nhất và thương hiệu bò sữa Mộc Châu nổi tiếng.',
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Khai thác thế mạnh ở Trung du và miền núi phía Bắc',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf23_a', text: 'a) Trung du và miền núi phía Bắc là vùng có mật độ dân số cao hơn mức trung bình chung của cả nước.', isTrue: false },
      { id: 'tf23_b', text: 'b) Cây chè và cây dược liệu trở thành thế mạnh của vùng chủ yếu do đất feralit và khí hậu có mùa đông lạnh.', isTrue: true },
      { id: 'tf23_c', text: 'c) Tất cả các tỉnh trong vùng Trung du và miền núi phía Bắc đều có thế mạnh về khai thác thủy sản nhờ tiếp giáp với vùng biển phía Đông.', isTrue: false },
      { id: 'tf23_d', text: 'd) Việc hình thành vùng chuyên canh bò sữa quy mô lớn tại Mộc Châu (Sơn La) là kết quả của việc khai thác tối ưu lợi thế so sánh về khí hậu cao nguyên mát mẻ gắn với tổ chức sản xuất hiện đại.', isTrue: true }
    ]
  },
  {
    id: 'tf24',
    type: 'true_false',
    text: 'Cho thông tin sau:\nDịch vụ là ngành kinh tế chủ lực chiếm tỉ trọng GDP cao nhất, đóng vai trò quan trọng trong việc thúc đẩy tăng trưởng và hội nhập quốc tế của nước ta. Sự phát triển của ngành chịu tác động mạnh mẽ từ trình độ phát triển kinh tế, chính sách ưu tiên và quy mô dân số với sức mua ngày càng lớn. Đặc biệt, thành tựu khoa học – công nghệ hiện đại đã làm thay đổi phương thức cung ứng và tạo ra nhiều loại hình dịch vụ số mới. Vị trí địa lý thuận lợi cùng các giá trị văn hóa, lịch sử cũng là những nhân tố nền tảng thúc đẩy sự phân bố đa dạng của các ngành du lịch, vận tải. Tuy nhiên, chất lượng nguồn nhân lực và tốc độ ứng dụng công nghệ số vẫn là những rào cản chính cần khắc phục để ngành phát triển bền vững.',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Thương mại và du lịch',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf24_a', text: 'a) Ngành dịch vụ hiện nay đã trở thành ngành chiếm tỉ trọng cao nhất trong cơ cấu GDP.', isTrue: true },
      { id: 'tf24_b', text: 'b) Sự phân bố và quy mô phát triển của ngành dịch vụ nước ta chịu tác động trực tiếp từ trình độ phát triển kinh tế và đặc điểm dân cư.', isTrue: true },
      { id: 'tf24_c', text: 'c) Các loại hình dịch vụ mới hiện nay xuất hiện ngày càng nhiều ở nước ta chủ yếu nhờ vào lợi thế về vị trí địa lý thuận lợi.', isTrue: false },
      { id: 'tf24_d', text: 'd) Trong bối cảnh toàn cầu hóa, việc sở hữu vị trí địa lí thuận lợi là yếu tố chính để ngành dịch vụ nước ta xóa bỏ các rào cản về chất lượng nguồn nhân lực.', isTrue: false }
    ]
  },
  {
    id: 'tf25',
    type: 'true_false',
    text: 'Cho thông tin sau:\nThiên nhiên Việt Nam phân hóa thành ba vùng rõ rệt gồm vùng biển và thềm lục địa, vùng đồng bằng ven biển và vùng đồi núi. Vùng biển và thềm lục địa mang tính chất nhiệt đới ẩm dồi dào với các hệ sinh thái đặc trưng như san hô, rừng ngập mặn; trong khi vùng đồng bằng lại chịu tác động mạnh mẽ của con người làm biến đổi giới sinh vật nguyên sinh. Vùng đồi núi chiếm diện tích lớn nhất, có sự phân hóa phức tạp do tương tác giữa hướng núi và gió mùa, tạo nên sự khác biệt giữa Đông Bắc với Tây Bắc và sự đối lập mưa - khô giữa 2 sườn của dãy Trường Sơn.',
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf25_a', text: 'a) Đoạn văn bản trên thể hiện sự phân hóa của thiên nhiên nước ta theo bắc - nam.', isTrue: false },
      { id: 'tf25_b', text: 'b) Vùng biển và thềm lục địa có diện tích lớn nhất và thể hiện rõ nhất sự phân hoá Đông - Tây.', isTrue: false },
      { id: 'tf25_c', text: 'c) Sự đối lập mùa mưa, mùa khô giữa hai sườn của dãy Trường Sơn xảy ra trong suốt thời kì gió mùa mùa hạ.', isTrue: false },
      { id: 'tf25_d', text: 'd) Việc khai thác tài nguyên thiên nhiên ở mỗi khu vực cần gắn với bảo vệ môi trường và phát triển bền vững, nhất là ở các khu vực miền núi dễ bị xói mòn, sạt lở và suy giảm đa dạng sinh học.', isTrue: true }
    ]
  },
  {
    id: 'tf26',
    type: 'true_false',
    text: 'Cho bảng số liệu Giá trị xuất, nhập khẩu của một số quốc gia Đông Nam Á năm 2023. Nhận xét các phát biểu sau:',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Khu vực Đông Nam Á',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf26_a', text: 'a) Các quốc gia có cán cân thương mại xuất siêu.', isTrue: false },
      { id: 'tf26_b', text: 'b) Xin-ga-po có trị giá xuất siêu lớn hơn Ma-lai-xi-a.', isTrue: true },
      { id: 'tf26_c', text: 'c) Trị giá xuất nhập khẩu của Phi-lip-pin cao hơn Ma-lai-xi-a.', isTrue: false },
      { id: 'tf26_d', text: 'd) Trị giá nhập siêu của Phi-lip-pin gấp hơn 300 lần Cam-pu-chia.', isTrue: true }
    ]
  },
  {
    id: 'sa27',
    type: 'short_answer',
    text: 'Năm 2024, dân số Việt Nam là 101,3 triệu người, tỉ lệ dân số phụ thuộc là 47,0%, hãy cho biết lực lượng lao động là bao nhiêu triệu người (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    correctAnswer: '53.7',
    unit: 'triệu người',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa28',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Sản lượng điện và cơ cấu sản lượng điện của nước ta giai đoạn 2010 – 2024.\n\n| Năm | 2010 | 2024 |\n|---|---|---|\n| Sản lượng điện (tỉ kWh) | 91,7 | 293,1 |\n| Tỉ trọng thủy điện (%) | 38,0 | 28,4 |\n\nCăn cứ vào bảng số liệu, hãy cho biết sản lượng thuỷ điện năm 2024 cao hơn sản lượng thuỷ điện năm 2010 bao nhiêu tỉ kWh? (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển công nghiệp',
    correctAnswer: '48.4',
    unit: 'tỉ kWh',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa29',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Nhiệt độ không khí trung bình các tháng năm 2024 tại trạm quan trắc Đà Lạt (°C).\n\n| Tháng | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n| Nhiệt độ | 16,5 | 17,5 | 18,6 | 18,5 | 19,6 | 19,7 | 19,6 | 19,2 | 19,1 | 18,6 | 18,0 | 16,4 |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết biên độ nhiệt độ không khí trung bình của năm 2024 tại trạm quan trắc Đà Lạt là bao nhiêu °C (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '3.3',
    unit: '°C',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa30',
    type: 'short_answer',
    text: 'Năm 2024, dân số trung bình ở vùng Đông Nam Bộ đạt 19239,4 nghìn người, trong đó dân số nông thôn đạt 6373,6 nghìn người. Cho biết tỉ lệ dân số thành thị ở Đông Nam Bộ so với toàn vùng năm 2024 là bao nhiêu phần trăm? (làm tròn kết quả đến số thập phân thứ nhất).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Phát triển kinh tế - xã hội ở Đông Nam Bộ',
    correctAnswer: '66.9',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa31',
    type: 'short_answer',
    text: 'Năm 2024, số thuê bao điện thoại của nước ta là 121 278,6 nghìn thuê bao, số dân là 101,3 triệu người. Hãy cho biết số thuê bao điện thoại bình quân đầu người của nước ta năm 2024 là bao nhiêu thuê bao/người (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    correctAnswer: '1.2',
    unit: 'thuê bao/người',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa32',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Lượng mưa, lượng bốc hơi tại một số địa phương ở nước ta năm 2024 (mm).\n\n| Địa phương | Lượng mưa | Lượng bốc hơi |\n|---|---|---|\n| Hà Nội | 1659 | 965 |\n| Huế | 2883 | 932 |\n| Phan Thiết | 1073 | 1380 |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết địa phương có cân bằng ẩm nhỏ nhất năm 2024 là bao nhiêu mm (làm tròn kết quả đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '-307',
    unit: 'mm',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc91',
    type: 'multiple_choice',
    text: 'Cho biểu đồ Diện tích gieo trồng và sản lượng lúa của nước ta, giai đoạn 2015 - 2023. Nhận định nào sau đây đúng về tình hình ngành trồng lúa nước ta giai đoạn 2015 – 2023?',
    options: [
      'Năng suất lúa nước ta giai đoạn 2015- 2023 có xu hướng giảm.',
      'Giai đoạn 2015 – 2023, diện tích trồng lúa tăng 708,7 nghìn ha.',
      'Giai đoạn 2015 – 2023, diện tích trồng lúa giảm, sản lượng lúa tăng.',
      'Sản lượng giảm chậm hơn diện tích chủ yếu do việc áp dụng tiến bộ kĩ thuật làm tăng năng suất lúa.'
    ],
    correctAnswerIndex: 3,
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc92',
    type: 'multiple_choice',
    text: 'Thiên tai nào sau đây ở nước ta mà việc phòng chống phải luôn kết hợp chống lụt, úng ở đồng bằng và chống lũ, chống xói mòn ở miền núi?',
    options: [
      'Lốc xoáy.',
      'Sương muối.',
      'Hạn hán.',
      'Bão.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên tai và biện pháp phòng chống',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc93',
    type: 'multiple_choice',
    text: 'Dịch vụ nào sau đây thuộc ngành viễn thông ở nước ta hiện nay?',
    options: [
      'Chuyển điện hoa.',
      'Chuyển phát thư.',
      'Kết nối internet.',
      'Viết phần mềm.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc94',
    type: 'multiple_choice',
    text: 'Ở nước ta hiện nay, vùng Đồng bằng sông Cửu Long',
    options: [
      'có dân số đông nhất nước ta.',
      'giáp biển Đông và Cam-pu-chia.',
      'có số tỉnh, thành nhiều nhất nước ta.',
      'tiếp giáp với vùng Nam Trung Bộ.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc95',
    type: 'multiple_choice',
    text: 'Phát biểu nào sau đây không đúng với ngành hàng không của nước ta hiện nay?',
    options: [
      'Cơ sở vật chất hiện đại hóa nhanh chóng.',
      'Ngành non trẻ nhưng phát triển khá nhanh.',
      'Vận chuyển khối lượng hàng hóa lớn nhất.',
      'Đã có cả các cảng quốc tế và cảng nội địa.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc96',
    type: 'multiple_choice',
    text: 'Ở ven biển của vùng Nam Trung Bộ hiện nay có thế mạnh để',
    options: [
      'khai thác bô-xit.',
      'trồng cây công nghiệp.',
      'phát triển du lịch.',
      'chuyên canh cây lúa.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc97',
    type: 'multiple_choice',
    text: 'Vùng đất của nước ta',
    options: [
      'gồm phần đất liền và nội thủy.',
      'giáp với Lào và Mi-an-ma.',
      'có diện tích lớn hơn vùng biển.',
      'có đường biên giới kéo dài.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí tự nhiên',
    lesson: 'Vị trí địa lí và phạm vi lãnh thổ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc98',
    type: 'multiple_choice',
    text: 'Tính chất nhiệt đới ẩm gió mùa của thiên nhiên nước ta được thể hiện rõ nhất qua quá trình ngoại lực nào sau đây?',
    options: [
      'Địa hình ổn định, ít bị biến đổi.',
      'Nội lực hoạt động mạnh, tạo núi cao.',
      'Phong hoá, xâm thực và bồi tụ mạnh.',
      'Phong hoá chậm, vỏ phong hoá mỏng.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc99',
    type: 'multiple_choice',
    text: 'Nuôi trồng thủy sản ở nước ta hiện nay',
    options: [
      'chưa gắn với an toàn thực phẩm.',
      'áp dụng nhiều mô hình nuôi hiện đại.',
      'chủ yếu dựa vào hình thức nuôi tự nhiên.',
      'chỉ tập trung vào một vài đối tượng nuôi.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc100',
    type: 'multiple_choice',
    text: 'Định hướng phát triển công nghiệp theo hướng công nghệ cao, ít phát thải của Đồng bằng sông Hồng xuất phát chủ yếu từ',
    options: [
      'trình độ đô thị hóa cao, mật độ dân cư lớn, nhu cầu cải thiện chất lượng sống.',
      'cơ cấu công nghiệp đa dạng, nhiều ngành truyền thống, khả năng thu hút lao động cao.',
      'sức ép môi trường lớn, yêu cầu phát triển bền vững, hội nhập sâu chuỗi giá trị toàn cầu.',
      'tốc độ công nghiệp hóa nhanh, số lượng khu công nghiệp tăng, sản lượng công nghiệp lớn.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc101',
    type: 'multiple_choice',
    text: 'Cơ cấu kinh tế theo thành phần ở nước ta hiện nay chuyển dịch theo hướng',
    options: [
      'thu hẹp vai trò của kinh tế tư nhân.',
      'đa dạng các hình thức sở hữu kinh tế.',
      'chỉ phát triển khu vực kinh tế nhà nước.',
      'hạn chế phát triển kinh tế có vốn nước ngoài.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc102',
    type: 'multiple_choice',
    text: 'Loại hình du lịch nổi bật trên các cao nguyên của vùng Nam Trung Bộ hiện nay là',
    options: [
      'du lịch đô thị và hội nghị.',
      'du lịch biển đảo và nghỉ dưỡng.',
      'du lịch thương mại và mua sắm.',
      'du lịch sinh thái và du lịch văn hoá.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc103',
    type: 'multiple_choice',
    text: 'Cơ cấu dân số theo dân tộc ở Việt Nam có đặc điểm nào sau đây?',
    options: [
      'Các dân tộc phân bố tách biệt, ít có sự giao lưu.',
      'Dân tộc Kinh chiếm tỉ lệ thấp hơn các dân tộc khác.',
      'Chủ yếu là các dân tộc thiểu số sinh sống trên cả nước.',
      'Có nhiều dân tộc cùng sinh sống, chủ yếu là dân tộc Kinh.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc104',
    type: 'multiple_choice',
    text: 'Việc sử dụng lao động ở nước ta hiện nay có đặc điểm nào sau đây?',
    options: [
      'Chuyển dịch theo ngành.',
      'Ít thay đổi theo thời gian.',
      'Tập trung vào nông nghiệp.',
      'Phân bố đồng đều giữa các ngành.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc105',
    type: 'multiple_choice',
    text: 'Sản phẩm của ngành công nghiệp sản xuất đồ uống là',
    options: [
      'thủy sản ướp đông.',
      'cà phê bột và cà phê hòa tan.',
      'Sữa tươi.',
      'Nước tinh khiết.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc106',
    type: 'multiple_choice',
    text: 'Ảnh hưởng nào sau đây của sự phân hoá thiên nhiên là cơ sở trực tiếp để nước ta hình thành các vùng kinh tế với thế mạnh khác nhau?',
    options: [
      'Làm cho thiên tai xảy ra thường xuyên và ngày càng phức tạp.',
      'Tạo ra sự khác biệt về điều kiện tự nhiên giữa các vùng, miền.',
      'Dẫn đến sự khác nhau về trình độ phát triển giữa các địa phương.',
      'Gây khó khăn cho việc tổ chức sản xuất nông nghiệp quy mô lớn.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc107',
    type: 'multiple_choice',
    text: 'Sự phát triển tổng hợp các ngành kinh tế biển ở Đông Nam Bộ gắn liền chặt chẽ nhất với thế mạnh nào sau đây?',
    options: [
      'Khí hậu ven biển ôn hòa, ít chịu tác động của các loại thiên tai.',
      'Dân cư ven biển đông, có kinh nghiệm lâu năm trong khai thác biển.',
      'Đường bờ biển dài, nhiều cửa sông thuận lợi cho nuôi trồng thủy sản.',
      'Vùng biển và thềm lục địa rộng, giàu tài nguyên, gần các ngư trường lớn.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đông Nam Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc108',
    type: 'multiple_choice',
    text: 'Các cây trồng nào sau đây ở nước ta là cây công nghiệp lâu năm?',
    options: [
      'Mía, đậu tương.',
      'Điều, bông.',
      'Lạc, hồ tiêu.',
      'Chè, cà phê.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'tf27',
    type: 'true_false',
    text: 'Cho thông tin sau:\nBắc Trung Bộ có thế mạnh phát triển cơ cấu nông - lâm - thủy sản nhờ địa hình phân hóa từ Tây sang Đông và độ che phủ rừng cao. Khu vực đồi núi phía tây ưu tiên lâm nghiệp và chăn nuôi gia súc lớn, trong khi đồng bằng ven biển tập trung cây công nghiệp hàng năm và cây ăn quả. Ngành thủy sản đang trở thành mũi nhọn kinh tế nhờ kết hợp nuôi trồng đầm phá với đánh bắt xa bờ gắn liền bảo vệ chủ quyền biển đảo. Vùng sở hữu nguồn lao động cần cù và hệ thống cảng biển đang được đầu tư mạnh mẽ để thu hút vốn nước ngoài. Tuy nhiên, thiên tai bão lũ và biến đổi khí hậu vẫn là những hạn chế lớn nhất gây ảnh hưởng trực tiếp đến sản xuất và đời sống tại đây.',
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Bắc Trung Bộ',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf27_a', text: 'a) Phần lớn diện tích rừng của vùng Bắc Trung Bộ là rừng trồng và tập trung chủ yếu ở dải đồng bằng ven biển.', isTrue: false },
      { id: 'tf27_b', text: 'b) Dải đồng bằng ven biển với đặc điểm đất cát pha là điều kiện lý tưởng nhất để vùng hình thành các vùng chuyên canh cây lúa năng suất cao.', isTrue: false },
      { id: 'tf27_c', text: 'c) Sự đa dạng của các sản phẩm nông nghiệp và lâm nghiệp ở Bắc Trung Bộ là kết quả của sự phân hoá khí hậu theo độ cao địa hình.', isTrue: true },
      { id: 'tf27_d', text: 'd) Việc đẩy mạnh đánh bắt xa bờ ở các tỉnh như Nghệ An, Thanh Hóa không chỉ mang lại giá trị kinh tế mà còn trực tiếp tham gia vào việc bảo vệ chủ quyền biển đảo.', isTrue: true }
    ]
  },
  {
    id: 'tf28',
    type: 'true_false',
    text: 'Cho thông tin sau:\nNông nghiệp Việt Nam có thế mạnh lớn về nền nông nghiệp nhiệt đới đa dạng nhờ sự phân hóa của địa hình và khí hậu, cùng nguồn lao động giàu kinh nghiệm. Trong trồng trọt, nước ta giữ vững vị thế xuất khẩu gạo hàng đầu và hình thành các vùng chuyên canh cây công nghiệp, cây ăn quả quy mô lớn. Ngành chăn nuôi đang tiến tới hiện đại hóa với các đối tượng chủ lực là lợn, gia cầm và gia súc lớn. Xu hướng tương lai của ngành là phát triển nông nghiệp xanh, bền vững theo chuỗi giá trị để nâng cao sức cạnh tranh trên thị trường quốc tế.',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf28_a', text: 'a) Đồng bằng sông Cửu Long hiện là vùng sản xuất lúa và cung cấp phần lớn sản lượng gạo xuất khẩu của cả nước.', isTrue: true },
      { id: 'tf28_b', text: 'b) Cơ cấu ngành trồng trọt nước ta hiện nay đang chuyển dịch theo hướng tăng tỉ trọng các loại cây trồng có ưu thế so sánh và giá trị kinh tế cao.', isTrue: true },
      { id: 'tf28_c', text: 'c) Chăn nuôi gia cầm và lợn của nước ta phân bố tập trung chủ yếu ở các vùng đồi núi thấp nhờ có diện tích đồng cỏ rộng lớn.', isTrue: false },
      { id: 'tf28_d', text: 'd) Sự sụt giảm diện tích gieo trồng lúa trong những năm gần đây là nguyên nhân chính dẫn đến việc nước ta mất đi vị thế xuất khẩu gạo hàng đầu thế giới.', isTrue: false }
    ]
  },
  {
    id: 'tf29',
    type: 'true_false',
    text: 'Cho thông tin sau:\nThiên nhiên nước ta có sự phân hóa Bắc – Nam rõ rệt. Phần lãnh thổ phía Bắc có khí hậu nhiệt đới ẩm gió mùa với mùa đông lạnh, nhiệt độ trung bình năm trên 20°C và biên độ nhiệt lớn. Cảnh quan tiêu biểu tại đây là đới rừng nhiệt đới gió mùa, nơi sinh vật nhiệt đới chung sống cùng các loài cận nhiệt và ôn đới. Trái lại, phần phía Nam mang tính chất cận xích đạo gió mùa, nóng quanh năm (trên 25°C) với hai mùa mưa – khô phân hóa sâu sắc. Hệ sinh thái phía Nam đặc trưng bởi đới rừng cận xích đạo gió mùa, phổ biến các loài thú lớn và thực vật chịu hạn.',
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf29_a', text: 'a) Ranh giới tự nhiên phân chia thiên nhiên nước ta thành hai phần lãnh thổ phía Bắc và phía Nam là dãy núi Bạch Mã.', isTrue: true },
      { id: 'tf29_b', text: 'b) Biên độ nhiệt độ trung bình năm ở phần lãnh thổ phía Bắc thường nhỏ hơn so với phần lãnh thổ phía Nam.', isTrue: false },
      { id: 'tf29_c', text: 'c) Cảnh sắc thiên nhiên miền Bắc thay đổi theo mùa chủ yếu do sự tương phản giữa mùa mưa dồi dào và mùa khô sâu sắc.', isTrue: false },
      { id: 'tf29_d', text: 'd) Hiện tượng thực vật rụng lá vào mùa khô tại một số khu vực ở phía Nam là cơ chế thích nghi của sinh vật với tình trạng thiếu hụt độ ẩm kéo dài.', isTrue: true }
    ]
  },
  {
    id: 'tf30',
    type: 'true_false',
    text: 'Cho biểu đồ Diện tích và dân số của một số quốc gia Đông Nam Á năm 2024. Nhận xét các phát biểu sau:',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Khu vực Đông Nam Á',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf30_a', text: 'a) Thái Lan có mật độ dân số cao nhất.', isTrue: false },
      { id: 'tf30_b', text: 'b) Mật độ dân số của Việt Nam gấp hơn 3,5 lần của Mi-an-ma.', isTrue: true },
      { id: 'tf30_c', text: 'c) Mi-an-ma có diện tích lớn nhất nhưng mật độ dân số nhỏ nhất.', isTrue: true },
      { id: 'tf30_d', text: 'd) Việt Nam có mật độ dân số cao do quy mô dân số và diện tích lớn.', isTrue: false }
    ]
  },
  {
    id: 'sa33',
    type: 'short_answer',
    text: 'Năm 2024, dân số Việt Nam là 101,3 triệu người. Trong đó, số dân nam là chiếm 49,9%, số dân nữ chiếm 50,1%. Cho biết tỉ số giới tính của dân số nước ta năm 2024 là bao nhiêu phần trăm. (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    correctAnswer: '99.6',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa34',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Dân số và sản lượng lúa cả năm của nước ta.\n\n| Năm | 2010 | 2024 |\n|---|---|---|\n| Sản lượng lúa (nghìn tấn) | 40005,6 | 43451,6 |\n| Dân số (nghìn người) | 87067,3 | 101343,8 |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết bình quân sản lượng lúa theo đầu người của nước ta năm 2024 so với năm 2010 giảm bao nhiêu kg/người? (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    correctAnswer: '30.7',
    unit: 'kg/người',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa35',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Nhiệt độ không khí trung bình các tháng năm 2024 tại trạm quan trắc Sơn La (°C).\n\n| Tháng | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n| Nhiệt độ | 16,6 | 19,5 | 22,1 | 28,1 | 25,1 | 26,1 | 25,9 | 25,3 | 24,8 | 22,4 | 18,6 | 16,1 |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết nhiệt độ không khí trung bình của năm 2024 tại trạm quan trắc Sơn La là bao nhiêu °C (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '22.6',
    unit: '°C',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa36',
    type: 'short_answer',
    text: 'Năm 2024, tổng mức bán lẻ hàng hoá và doanh thu dịch vụ tiêu dùng cả nước là 6447 nghìn tỉ đồng, trong đó Đông Nam Bộ chiếm 21,4%. Hãy cho biết tổng mức bán lẻ hàng hoá và doanh thu dịch vụ tiêu dùng của Đông Nam Bộ năm 2024 là bao nhiêu nghìn tỉ đồng (làm tròn kết quả đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Thương mại và du lịch',
    correctAnswer: '1380',
    unit: 'nghìn tỉ đồng',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa37',
    type: 'short_answer',
    text: 'Năm 2024, giá trị nhập khẩu hàng hóa và dịch vụ của nước ta là 380,8 tỉ USD. Cán cân xuất nhập khẩu hàng hóa và dịch vụ là 25,2 tỉ USD. Cho biết tổng giá trị xuất nhập khẩu hàng hóa và dịch vụ của nước ta năm 2024 là bao nhiêu tỉ USD. (Làm tròn kết quả đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Thương mại và du lịch',
    correctAnswer: '787',
    unit: 'tỉ USD',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa38',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Lượng mưa các tháng năm 2024 tại trạm quan trắc Huế và trạm quan trắc Đà Nẵng (mm).\n\n| Trạm | Lượng mưa nhỏ nhất |\n|---|---|\n| Huế | 6,6 (tháng 4) |\n| Đà Nẵng | 0,9 (tháng 3) |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết lượng mưa của tháng có lượng mưa nhỏ nhất tại trạm quan trắc Huế cao hơn lượng mưa của tháng có lượng mưa nhỏ nhất tại trạm quan trắc Đà Nẵng năm 2024 là bao nhiêu mm.',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '5.7',
    unit: 'mm',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc109',
    type: 'multiple_choice',
    text: 'Cho biểu đồ Tỉ suất sinh thô và tỉ suất tử thô của nước ta, giai đoạn 2020-2024. Nhận xét nào sau đây đúng với biểu đồ trên?',
    options: [
      'Tỉ suất sinh thô của nước ta liên tục tăng qua các năm.',
      'Tỉ suất tử thô luôn cao hơn tỉ suất sinh thô.',
      'Tỉ suất sinh thô của nước ta giảm 2,8‰ trong giai đoạn 2020-2024.',
      'Gia tăng tự nhiên của nước ta 0,81% vào năm 2024.'
    ],
    correctAnswerIndex: 2,
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc110',
    type: 'multiple_choice',
    text: 'Loại thiên tai nào sau đây thường xảy ra vào mùa mưa ở nước ta?',
    options: [
      'Mưa đá.',
      'Lũ quét.',
      'Rét hại.',
      'Sương muối.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên tai và biện pháp phòng chống',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc111',
    type: 'multiple_choice',
    text: 'Dịch vụ nào sau đây thuộc ngành bưu chính ở nước ta hiện nay?',
    options: [
      'Cáp quang.',
      'Chuyển tiền.',
      'Kết nối internet.',
      'Truyền số liệu.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc112',
    type: 'multiple_choice',
    text: 'Vị trí địa lí của Đồng bằng sông Cửu Long',
    options: [
      'giáp vịnh Bắc Bộ ở phía bắc.',
      'giáp Trung Quốc ở phía đông.',
      'tiếp giáp với Vịnh Thái Lan.',
      'tiếp giáp với Bắc Trung Bộ.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc113',
    type: 'multiple_choice',
    text: 'Giao thông vận tải đường hàng không ở nước ta hiện nay',
    options: [
      'chuyên trở người và hàng nhẹ.',
      'chỉ sử dụng nhiên liệu sinh học.',
      'chỉ có tuyến bay nội địa.',
      'chủ yếu vận chuyển hàng hóa.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc114',
    type: 'multiple_choice',
    text: 'Nam Trung Bộ hiện nay có thế mạnh để',
    options: [
      'khai thác tổng hợp kinh tế biển.',
      'khai thác than nâu và than đá.',
      'trồng rau, cận nhiệt và ôn đới.',
      'chuyên canh cây ăn quả và cây lúa.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc115',
    type: 'multiple_choice',
    text: 'Vùng biển của nước ta',
    options: [
      'có diện tích nhỏ hơn vùng đất.',
      'ở phía tây Thái Bình Dương.',
      'giáp với vùng biển Đông-Ti-Mo.',
      'có kiểu khí hậu xích đạo gió mùa.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí tự nhiên',
    lesson: 'Vị trí địa lí và phạm vi lãnh thổ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc116',
    type: 'multiple_choice',
    text: 'Sông ngòi nước ta có chế độ nước theo mùa là do nguyên nhân chủ yếu nào sau đây?',
    options: [
      'Mưa nhiều trên địa hình đồi núi thấp.',
      'Trong năm có hai mùa mưa và khô.',
      'Đội núi bị cắt xẻ mạnh và mưa nhiều.',
      'Độ dốc địa hình lớn và mưa nhiều.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc117',
    type: 'multiple_choice',
    text: 'Điều kiện thuận lợi cho việc nuôi trồng thủy sản nước ngọt ở nước ta là',
    options: [
      'nhiều vụng, vịnh nước sâu.',
      'đường bờ biển dài, nhiều hải sản.',
      'có nhiều sông, suối, ao, hồ.',
      'có nhiều đầm phá và ngư trường.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc118',
    type: 'multiple_choice',
    text: 'Việc phát triển các ngành dịch vụ ở vùng Đồng bằng sông Hồng nhằm',
    options: [
      'thu hút nguồn vốn đầu tư nước ngoài.',
      'giải quyết vấn đề việc làm của vùng.',
      'đẩy nhanh tốc độ chuyển dịch kinh tế.',
      'sử dụng hiệu quả nguồn tài nguyên.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc119',
    type: 'multiple_choice',
    text: 'Cơ cấu ngành công nghiệp, nước ta đang chuyển dịch theo hướng',
    options: [
      'Tăng tỉ trọng công nghiệp khai khoáng, giảm công nghiệp chế biến, chế tạo.',
      'Giảm công nghiệp chế biến, chế tạo, tăng công nghiệp sản xuất phân phối điện…',
      'Giảm công nghiệp khai khoáng, tăng công nghiệp chế biến, chế tạo.',
      'Tăng công nghiệp chế biến, chế tạo, giảm công nghiệp cung cấp nước.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc120',
    type: 'multiple_choice',
    text: 'Cao nguyên Trung Bộ hiện nay phát triển mạnh',
    options: [
      'thủy điện, trồng cây công nghiệp.',
      'nhiệt điện, khai thác gỗ quý hiếm.',
      'khu chế xuất, khu công nghệ cao.',
      'nuôi trồng thủy sản, chăn nuôi lợn.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Tây Nguyên',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc121',
    type: 'multiple_choice',
    text: 'Dân cư nông thôn của nước ta có đặc điểm nào sau đây?',
    options: [
      'Chiếm tỉ lệ cao và ngày càng giảm.',
      'Chiếm tỉ lệ thấp và ngày càng tăng.',
      'Chiếm tỉ lệ thấp và ngày càng giảm.',
      'Chiếm tỉ lệ cao và ngày càng tăng.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc122',
    type: 'multiple_choice',
    text: 'Nhận định nào sau đây đúng với chất lượng lao động của nước ta?',
    options: [
      'Phần lớn lao động có trình độ cao đẳng trở lên.',
      'Chất lượng lao động ngày càng tăng.',
      'Lao động nước ta đều chưa qua đào tạo.',
      'Phần lớn lao động nước ta đã qua đào tạo.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc123',
    type: 'multiple_choice',
    text: 'Nhà máy thuỷ điện Sơn La, Hoà Bình được xây dựng trên lưu vực',
    options: [
      'sông Hồng.',
      'sông Lô.',
      'sông Chảy.',
      'sông Đà.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc124',
    type: 'multiple_choice',
    text: 'Sự phân hóa thiên nhiên nước ta theo chiều Đông - Tây ở vùng đồi núi mang lại ý nghĩa chủ yếu nào sau đây?',
    options: [
      'Phát triển nông nghiệp với cơ cấu cây trồng vật nuôi, cơ cấu mùa vụ đa dạng.',
      'Phát triển nền nông nghiệp hàng hóa, chuyên canh cây lương thực và ăn quả.',
      'Phát triển nền nông nghiệp nhiệt đới, chủ yếu phát triển các cây lương thực.',
      'Phát triển nền nông nghiệp nhiệt đới, chỉ thuận lợi cho việc trồng lúa nước.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc125',
    type: 'multiple_choice',
    text: 'Hiệu quả kinh tế chủ yếu mà cây công nghiệp lâu năm mang lại ở vùng Đông Nam Bộ là',
    options: [
      'thu hút nguồn vốn lớn nhất cả nước, mặt hàng xuất khẩu chủ yếu ở nước ta.',
      'tạo ra các mặt hàng xuất khẩu chủ lực, giải quyết việc làm, phân bố dân cư.',
      'nâng cao thu nhập cho người dân, hình thành cơ sở chế biến có quy mô lớn.',
      'cung cấp nguyên liệu cho công nghiệp, thúc đẩy đô thị hóa, tăng thu nhập.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đông Nam Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc126',
    type: 'multiple_choice',
    text: 'Nhóm cây nào sau đây chiếm tỉ trọng lớn nhất trong cơ cấu diện tích trồng trọt ở nước ta hiện nay?',
    options: [
      'Cây lương thực.',
      'Cây ăn quả.',
      'Cây công nghiệp.',
      'Cây rau đậu.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'tf31',
    type: 'true_false',
    text: 'Cho thông tin sau:\nĐất đai được coi là tài nguyên cơ bản của cao nguyên Nam Trung Bộ diện tích đất chủ yếu là đất đỏ bazan, tầng phong hoá dày; địa hình có các cao nguyên xếp tầng (cao nguyên Plâycu, Đăk Lăk, Mơ Nông, Lâm Viên...). Khí hậu ở cao nguyên của Nam Trung Bộ được chia làm hai mùa: mùa mưa từ tháng 5 đến hết tháng 10 và mùa khô từ tháng 11 đến tháng 4. Do ảnh hưởng của độ cao nên trong khi ở các cao nguyên cao 400–500 m khí hậu tương đối mát và mưa nhiều, riêng cao nguyên cao trên 1000m, khí hậu lại mát mẻ quanh năm mang đặc điểm của khí hậu núi cao.',
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Tây Nguyên',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf31_a', text: 'a) Bề mặt các cao nguyên thuận lợi cho hình thành vùng chuyên canh cây công nghiệp lâu năm.', isTrue: true },
      { id: 'tf31_b', text: 'b) Vùng trồng được cây công nghiệp có nguồn gốc cận nhiệt là do sự phân mùa của khí hậu.', isTrue: false },
      { id: 'tf31_c', text: 'c) Bề mặt các cao nguyên xếp tầng thuận lợi cho việc xây dựng các bậc thang thủy điện.', isTrue: false },
      { id: 'tf31_d', text: 'd) Cơ cấu cây công nghiệp thích hợp với địa hình, đất đai và khí hậu là cà phê, cao su, hồ tiêu, chè...', isTrue: true }
    ]
  },
  {
    id: 'tf32',
    type: 'true_false',
    text: 'Cho thông tin sau:\nNgành công nghiệp sản xuất, chế biến thực phẩm phân bố rộng khắp cả nước dựa trên cơ sở nguổn nguyên liệu tại chỗ. Các trung tâm công nghiệp chế biến thực phẩm lớn ở nước ta là Thành phố Hồ Chí Minh, Hà Nội, Đồng Nai, Hải Phòng, Đà Nẵng, Cần Thơ,...',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf32_a', text: 'a) Các trung tâm chế biến thực phẩm lớn ở nước ta tập trung ở các thành phố lớn.', isTrue: true },
      { id: 'tf32_b', text: 'b) Ngành chế biến thực phẩm phân bố rộng chủ yếu do nguồn nguyên liệu nhập khẩu phân bố khắp các vùng trong cả nước.', isTrue: false },
      { id: 'tf32_c', text: 'c) Việc tham gia vào các hiệp định thương mại tạo thuận lợi mở rộng thị trường xuất khẩu cho các mặt hàng chế biến của nước ta.', isTrue: true },
      { id: 'tf32_d', text: 'd) Lực lượng lao động đông, chất lượng cao là điều kiện chủ yếu góp phần nâng cao chất lượng các mặt hàng chế biến.', isTrue: false }
    ]
  },
  {
    id: 'tf33',
    type: 'true_false',
    text: 'Cho thông tin sau:\nLượng bốc hơi cũng như mọi yếu tố trong khí hậu gió mùa, đều có nhịp điệu mùa. Ở Bắc Bộ, do gió mùa đông bắc vừa hạ thấp nhiệt độ, vừa mang lại nhiều mây và mưa nhỏ, nhất là vào cuối mùa đông, nên lượng bốc hơi cao nhất vào mùa hạ, chủ yếu vào đầu mùa (từ tháng 5 đến tháng 7), ngoài ra là vào mùa thu (từ tháng 5 đến tháng 6), còn lượng bốc hơi giảm vào mùa đông, cực tiểu vào các tháng mưa phùn (tháng 2 và tháng 3).',
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf33_a', text: 'a) Ở Bắc Bộ vào mùa khô, các tháng đầu và cuối mùa thường có lượng mưa nhỏ hơn.', isTrue: false },
      { id: 'tf33_b', text: 'b) Mùa khô ở Bắc Bộ không sâu sắc như Nam Bộ do có mưa phùn cuối đông.', isTrue: true },
      { id: 'tf33_c', text: 'c) Cân bằng ẩm của nước ta luôn dương do lượng mưa lớn hơn lượng bốc hơi.', isTrue: true },
      { id: 'tf33_d', text: 'd) Các yếu tố tăng cường sức bốc hơi cho Bắc Bộ là địa hình, thảm thực vật.', isTrue: false }
    ]
  },
  {
    id: 'tf34',
    type: 'true_false',
    text: 'Cho biểu đồ Trị giá xuất khẩu dầu thô của In-đô-nê-xi-a và Ma-lai-xi-a, giai đoạn 2017 - 2024. Nhận xét các phát biểu sau:',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Khu vực Đông Nam Á',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf34_a', text: 'a) Năm 2024 so với năm 2017, trị giá xuất khẩu dầu thô của Ma-lai-xi-a tăng hơn 1,2 lần.', isTrue: true },
      { id: 'tf34_b', text: 'b) Năm 2024 so với năm 2017, trị giá xuất khẩu dầu thô của In-đô-nê-xi-a tăng hơn 3 lần.', isTrue: false },
      { id: 'tf34_c', text: 'c) Năm 2024, trị giá xuất khẩu dầu thô của Ma-lai-xi-a cao gấp gần 4 lần In-đô-nê-xi-a.', isTrue: true },
      { id: 'tf34_d', text: 'd) Trị giá xuất khẩu dầu thô của Ma-lai-xi-a tăng liên tục, In-đô-nê-xi-a giảm liên tục trong giai đoạn 2017 - 2024.', isTrue: false }
    ]
  },
  {
    id: 'sa39',
    type: 'short_answer',
    text: 'Năm 2024 nước ta có 54 dân tộc sinh sống ở khắp các vùng lãnh thổ của đất nước, nhiều nhất là dân tộc Việt (Kinh) là 86,3 triệu người, các dân tộc khác là 14,8 triệu người. Cho biết người Việt (Kinh) chiếm bao nhiêu phần trăm trong tổng số dân nước ta năm 2024? (làm tròn kết quả đến số thập phân thứ nhất).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    correctAnswer: '85.4',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa40',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Sản lượng khai thác và nuôi trồng của nước ta, giai đoạn 2015-2024 (nghìn tấn).\n\n| Năm | 2024 |\n|---|---|\n| Khai thác | 4363,7 |\n| Nuôi trồng | 5433,5 |\n\nTheo bảng số liệu, cho biết tỉ trọng thủy sản khai thác của nước ta năm 2024 nhỏ hơn tỉ trọng thủy sản nuôi trồng bao nhiêu %. (Làm tròn kết quả đến chữ số thập phân thứ nhất).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    correctAnswer: '10.9',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa41',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Nhiệt độ không khí trung bình các tháng tại Lai Châu năm 2024 (°C).\n\n| Tháng | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n| Nhiệt độ | 15,5 | 17,6 | 20,3 | 23,6 | 25,5 | 26,3 | 25,9 | 25,6 | 24,9 | 22,8 | 19,6 | 16,5 |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết nhiệt độ không khí trung bình năm 2024 tại Lai Châu là bao nhiêu °C (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '22.0',
    unit: '°C',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa42',
    type: 'short_answer',
    text: 'Năm 2025, vùng Đông Nam Bộ có số dân 21,0 triệu người, với GRDP của vùng đạt 3955,9 nghìn tỉ đồng. Hãy cho biết thu nhập GRDP bình quân đầu người của vùng Đông Nam Bộ là bao nhiêu triệu đồng/người? (làm tròn số đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Phát triển kinh tế - xã hội ở Đông Nam Bộ',
    correctAnswer: '188',
    unit: 'triệu đồng/người',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa43',
    type: 'short_answer',
    text: 'Năm 2024, giá trị xuất khẩu hàng hóa và dịch vụ của nước ta là 405,5 tỉ USD. Cán cân xuất nhập khẩu hàng hóa và dịch vụ là 24,8 tỉ USD. Hãy cho biết tổng giá trị xuất nhập khẩu hàng hóa và dịch vụ của nước ta năm 2024 là bao nhiêu tỉ USD. (Làm tròn kết quả đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Thương mại và du lịch',
    correctAnswer: '786',
    unit: 'tỉ USD',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa44',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Lượng mưa các tháng năm 2024 tại trạm quan trắc Quy Nhơn và trạm quan trắc Cà Mau (mm).\n\n| Trạm | Lượng mưa thấp nhất |\n|---|---|\n| Quy Nhơn | 13,4 (tháng 6) |\n| Cà Mau | 0,2 (tháng 1) |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết năm 2024, lượng mưa của tháng có lượng mưa thấp nhất tại trạm quan trắc Quy Nhơn cao hơn lượng mưa của tháng có lượng mưa thấp nhất tại trạm quan trắc Cà Mau là bao nhiêu mm. (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '13.2',
    unit: 'mm',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc127',
    type: 'multiple_choice',
    text: 'Cho biểu đồ Sản lượng một số sản phẩm công nghiệp chủ yếu của nước ta, giai đoạn 2010 – 2024. Nhận xét nào sau đây đúng với biểu đồ trên?',
    options: [
      'Giai đoạn 2010 – 2024, dầu thô khai thác trong nước liên tục giảm.',
      'Giai đoạn 2010 – 2024, sản lượng than luôn cao hơn dầu thô trong nước.',
      'Năm 2024, sản lượng than gấp 5 lần sản lượng dầu thô khai thác trong nước.',
      'Giai đoạn 2010 – 2024, sản lượng than tăng 1,6 triệu tấn, dầu tăng 6,6 triệu tấn.'
    ],
    correctAnswerIndex: 1,
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc128',
    type: 'multiple_choice',
    text: 'Nguyên nhân chủ yếu gây ngập lụt ở đồng bằng sông Cửu Long là',
    options: [
      'mưa lớn và triều cường.',
      'bão lớn và lũ nguồn về.',
      'không có đê sông ngăn lũ.',
      'mưa bão trên diện rộng.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên tai và biện pháp phòng chống',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc129',
    type: 'multiple_choice',
    text: 'Ngành viễn thông nước ta hiện nay',
    options: [
      'tương đối đa dạng, không ngừng phát triển.',
      'thiết bị cũ kĩ lạc hậu, quy trình thủ công.',
      'cơ giới hóa, tự động hóa, phân bố hợp lí.',
      'tính phục vụ cao, mạng lưới rộng khắp.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc130',
    type: 'multiple_choice',
    text: 'Đồng bằng sông Cửu Long có',
    options: [
      'rất nhiều mỏ than tại thềm lục địa.',
      'nguồn dự trữ thuỷ năng dồi dào.',
      'hệ thống sông, kênh rạch dày đặc.',
      'bờ biển dài, nhiều vịnh nước sâu.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc131',
    type: 'multiple_choice',
    text: 'Mạng lưới giao thông vận tải của nước ta hiện nay',
    options: [
      'chưa được kết nối với khu vực.',
      'có các tuyến đường sắt cao tốc.',
      'gồm nhiều loại hình khác nhau.',
      'phân bố khá đều giữa các vùng.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc132',
    type: 'multiple_choice',
    text: 'Nam Trung Bộ có tiềm năng lớn trong sản xuất năng lượng tái tạo',
    options: [
      'từ nước biển, sức gió.',
      'từ mặt trời và sức gió.',
      'từ băng cháy, thủy triều.',
      'từ địa nhiệt, thủy triều.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Nam Trung Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc133',
    type: 'multiple_choice',
    text: 'Đất liền nước ta nằm hoàn toàn trong vùng nội chí tuyến bán cầu Bắc nên có',
    options: [
      'số giờ nắng nhiều.',
      'nhiều sông ngòi nhỏ.',
      'nhiều loại thổ nhưỡng.',
      'khoáng sản đa dạng.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Vị trí địa lí và phạm vi lãnh thổ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc134',
    type: 'multiple_choice',
    text: 'Thiên nhiên vùng núi Đông Bắc khác với Tây Bắc ở điểm nào sau đây?',
    options: [
      'Mùa đông lạnh đến sớm hơn ở các vùng núi thấp.',
      'Mùa đông bớt lạnh nhưng khô hạn hơn.',
      'Khí hậu lạnh chủ yếu do độ cao của địa hình.',
      'Mùa hạ đến sớm, đôi khi có gió Tây, lượng mưa giảm.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc135',
    type: 'multiple_choice',
    text: 'Nuôi trồng thủy sản nước lợ ở nước ta hiện nay',
    options: [
      'sản phẩm không được chế biến.',
      'phát triển mạnh ở tỉnh ven biển.',
      'tập trung ở các đảo lớn ven bờ.',
      'chưa gắn với thị trường tiêu thụ.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc136',
    type: 'multiple_choice',
    text: 'Ý nghĩa chủ yếu của việc chuyển dịch cơ cấu nông nghiệp ở Đồng bằng sông Hồng là',
    options: [
      'nâng cao hiệu quả kinh tế, khai thác tốt thế mạnh tự nhiên.',
      'giải quyết tốt vấn đề việc làm, đẩy mạnh sản xuất hàng hoá.',
      'tạo ra hàng xuất khẩu, thúc đẩy chuyển dịch cơ cấu ngành.',
      'giảm thiểu thiệt hại do thiên tai gây ra, đa dạng sản phẩm.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc137',
    type: 'multiple_choice',
    text: 'Hướng chuyển dịch công nghiệp chế biến của nước ta hiện nay là',
    options: [
      'hoàn toàn dành cho việc xuất khẩu.',
      'tăng tỉ trọng sản phẩm có giá trị cao.',
      'phân bố rất đồng đều giữa các vùng.',
      'giảm tối đa sở hữu ngoài Nhà nước.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc138',
    type: 'multiple_choice',
    text: 'Cao nguyên Nam Trung Bộ có thế mạnh thuỷ điện lớn vì',
    options: [
      'sông có nhiều hướng.',
      'đây là vùng đầu nguồn của các con sông.',
      'sông có nhiều phụ lưu.',
      'sông có sự phân mùa rõ rệt.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Tây Nguyên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc139',
    type: 'multiple_choice',
    text: 'Phân bố dân cư nước ta hiện nay',
    options: [
      'đồng đều ở các vùng kinh tế phát triển.',
      'gắn liền với trình độ phát triển kinh tế.',
      'rất phù hợp với sự phân bố tài nguyên.',
      'tập trung đông đúc ở những đảo xa bờ.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc140',
    type: 'multiple_choice',
    text: 'Chuyển dịch cơ cấu lao động nước ta hiện nay',
    options: [
      'chưa có sự thay đổi tỉ trọng các ngành.',
      'có quan hệ với quá trình công nghiệp hóa.',
      'không phù hợp với xu hướng hội nhập.',
      'giảm dần lao động có trình độ đại học.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc141',
    type: 'multiple_choice',
    text: 'Thế mạnh để chăn nuôi gia súc của vùng Trung du và miền núi Bắc Bộ là',
    options: [
      'mùa đông lạnh nhất cả nước.',
      'diện tích đồng cỏ lớn.',
      'mùa khô kéo dài.',
      'diện tích trồng cây lương thực lớn.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Khai thác thế mạnh ở Trung du và miền núi Bắc Bộ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc142',
    type: 'multiple_choice',
    text: 'Nguyên nhân nào sau đây là chủ yếu dẫn đến khí hậu nước ta phân hóa theo chiều Bắc – Nam?',
    options: [
      'Số giờ chiếu sáng trong năm và dải hội tụ nội chí tuyến.',
      'Dải hội tụ nội chí tuyến và sự thay đổi của góc nhập xạ.',
      'Sự thay đổi của góc nhập xạ và hoạt động của gió mùa.',
      'Hoạt động của gió mùa và số giờ chiếu sáng trong năm.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc143',
    type: 'multiple_choice',
    text: 'Nhận định nào sau đây đúng với thế mạnh kinh tế - xã hội để phát triển kinh tế của vùng Đông Nam Bộ?',
    options: [
      'Có lịch sử khai thác lãnh thổ lâu đời nhất nước ta.',
      'Tỉ lệ dân số nhập cư thấp nên không gây sức ép đến việc làm.',
      'Mật độ trung tâm công nghiệp dày đặc nhất cả nước.',
      'Là địa bàn thu hút đông đảo lao động có chuyên môn cao.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đông Nam Bộ',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc144',
    type: 'multiple_choice',
    text: 'Sản xuất lương thực ở nước ta hiện nay',
    options: [
      'hoàn toàn phục vụ cho xuất khẩu.',
      'phát triển theo hướng cơ giới hóa.',
      'chỉ tập trung tại vùng đồng bằng.',
      'chỉ đầu tư phát triển cây hoa màu.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'tf35',
    type: 'true_false',
    text: 'Cho đoạn thông tin sau:\nVùng chuyên canh là hình thức tổ chức lãnh thổ nông nghiệp dựa trên sự tập trung sản xuất một vài loại cây trồng, vật nuôi phù hợp với điều kiện kinh tế - xã hội. Hiện nay nước ta có các vùng chuyên canh khá đa dạng và việc phát triển vùng chuyên canh góp phần tăng nguồn cung nguyên liệu và nâng cao giá trị hàng hoá nông sản. Các vùng này thường có mức độ thâm canh cao, gắn với cơ giới hoá, hoá học hoá và thuỷ lợi hoá. Tuy nhiên, sự phụ thuộc quá lớn vào một số sản phẩm dễ làm tăng rủi ro khi thị trường biến động hoặc khi gặp thiên tai, dịch bệnh.',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Tổ chức lãnh thổ nông nghiệp',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf35_a', text: 'a) Vùng chuyên canh cây cà phê tập trung nhiều ở khu vực Nam Trung Bộ.', isTrue: true },
      { id: 'tf35_b', text: 'b) Bắc Trung Bộ là khu vực tập trung các vùng nuôi trồng thuỷ sản lớn nhất cả nước.', isTrue: false },
      { id: 'tf35_c', text: 'c) Phát triển vùng chuyên canh góp phần phân bố lại lao động, tạo điều kiện chuyên môn hoá lao động, giúp nâng cao trình độ tay nghề cho lao động ở các vùng nông thôn.', isTrue: true },
      { id: 'tf35_d', text: 'd) Việc hình thành các vùng chuyên canh cây công nghiệp gắn với công nghiệp chế biến sẽ có tác động nâng cao chất lượng và hạ giá thành sản phẩm, đồng thời làm tăng khả năng xuất khẩu nông sản.', isTrue: false }
    ]
  },
  {
    id: 'tf36',
    type: 'true_false',
    text: 'Cho thông tin sau:\nKhai thác than ở Việt Nam được phát triển từ rất sớm, trở thành ngành công nghiệp năng lượng chủ lực. Hiện nay, sản lượng khai thác ổn định, áp dụng nhiều công nghệ hiện đại giúp nâng cao năng suất, chất lượng và giảm tác động xấu đến môi trường.',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf36_a', text: 'a) Khai thác than ở nước ta chủ yếu phục vụ nhiệt điện và xuất khẩu.', isTrue: true },
      { id: 'tf36_b', text: 'b) Các mỏ than lớn tập trung ở khu vực Quảng Ninh và Đồng bằng sông Cửu Long.', isTrue: false },
      { id: 'tf36_c', text: 'c) Ngành than hiện đã được cơ giới hóa và tự động hóa ở mức cao.', isTrue: true },
      { id: 'tf36_d', text: 'd) Khai thác than bắt đầu phát triển mạnh từ thế kỉ XIX ở Việt Nam.', isTrue: true }
    ]
  },
  {
    id: 'tf37',
    type: 'true_false',
    text: 'Cho thông tin sau:\nÁp cao Xi-bia là trung tâm áp cao nhiệt lực hình thành do các lục địa Á – Âu rộng lớn bị mất nhiệt mạnh vào mùa đông. Nhiệt độ trong mùa đông tại đây dao động từ -40°C đến -15°C, trung bình là – 24°C. Trị số khí áp ở trung tâm của áp cao này khoảng 1 040 mb, cực đại có thể lên đến 1 080 mb.',
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf37_a', text: 'a) Gió mùa Đông Bắc của nước ta xuất phát từ áp cao Xi – bia.', isTrue: true },
      { id: 'tf37_b', text: 'b) Nửa đầu mùa đông, gió mùa Đông Bắc có tính chất lạnh, khô.', isTrue: true },
      { id: 'tf37_c', text: 'c) Gió mùa Đông Bắc lấn sâu vào nước ta chủ yếu do đồi núi thấp.', isTrue: false },
      { id: 'tf37_d', text: 'd) Gió mùa Đông Bắc là nguyên nhân gây nên mùa khô ở Nam Bộ.', isTrue: false }
    ]
  },
  {
    id: 'tf38',
    type: 'true_false',
    text: 'Cho biểu đồ Tỉ suất sinh thô, tỉ suất tử thô của một số quốc gia Đông Nam Á năm 2024. Nhận xét các phát biểu sau:',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Khu vực Đông Nam Á',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf38_a', text: 'a) Năm 2024, Việt Nam có tỉ suất tử thô thấp nhất khu vực Đông Nam Á.', isTrue: false },
      { id: 'tf38_b', text: 'b) Năm 2024, Bru-nây có gia tăng tự nhiên cao nhất khu vực Đông Nam Á.', isTrue: true },
      { id: 'tf38_c', text: 'c) Năm 2024, Việt Nam và Bru-nây có tỉ suất sinh thô cao gấp 2 lần Xin-ga-po.', isTrue: true },
      { id: 'tf38_d', text: 'd) Năm 2024, Ma-lai-xi-a có tỉ suất sinh thô cao hơn Xin-ga-po 7‰ và nhỏ hơn Việt Năm 1,2 lần.', isTrue: false }
    ]
  },
  {
    id: 'sa45',
    type: 'short_answer',
    text: 'Năm 2025, thành phố Cần Thơ có diện tích là 6 360,8 km², dân số 3 207,0 nghìn người. Vậy mật độ dân số trung bình ở thành phố Cần Thơ là bao nhiêu người/km²? (làm tròn kết quả đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    correctAnswer: '504',
    unit: 'người/km²',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa46',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Diện tích, sản lượng cây lương thực có hạt ở nước ta, giai đoạn 2021 – 2024.\n\n| Năm | 2021 | 2024 |\n|---|---|---|\n| Diện tích (triệu ha) | 8,1 | 8,0 |\n| Sản lượng (triệu tấn) | 48,3 | 47,9 |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết năng suất cây lương thực có hạt năm 2024 lớn hơn năng suất cây lương thực có hạt năm 2021 là bao nhiêu tạ/ha (Làm tròn kết quả đến số thập phân thứ nhất).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    correctAnswer: '0.2',
    unit: 'tạ/ha',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa47',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Nhiệt độ không khí trung bình các tháng tại Tuyên Quang năm 2024 (°C).\n\n| Tháng | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n| Nhiệt độ | 15,6 | 17,6 | 20,3 | 23,6 | 25,5 | 26,2 | 26,4 | 25,6 | 24,6 | 22,8 | 18,6 | 16,4 |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết biên nhiệt độ không khí năm 2024 tại Tuyên Quang là bao nhiêu °C?',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '10.8',
    unit: '°C',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa48',
    type: 'short_answer',
    text: 'Năm 2024, diện tích lúa của cả nước là 7,5 triệu ha, của Đồng bằng Sông Cửu Long là 3,32 triệu ha. Hãy cho biết tỉ trọng diện tích lúa của Đồng bằng sống Cửu Long so với tổng diện tích lúa của cả nước năm 2024 là bao nhiêu %. (Làm tròn kết quả đến số thập phân thứ nhất).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long',
    correctAnswer: '44.3',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa49',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Tình hình giá trị xuất nhập khẩu hàng hóa nước ta năm 2018 và 2024 (triệu USD).\n\n| Năm | 2018 | 2024 |\n|---|---|---|\n| Xuất khẩu | 243696,8 | 405935,4 |\n| Nhập khẩu | 237240,8 | 380990,6 |\n\nCăn cứ bảng số liệu trên, hãy cho biết cán cân xuất nhập khẩu năm 2024 gấp cán cân xuất nhập khẩu năm 2018 là bao nhiêu lần? (Làm tròn kết quả đến số thập phân thứ nhất).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Thương mại và du lịch',
    correctAnswer: '3.9',
    unit: 'lần',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa50',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Lượng mưa các tháng năm 2024 tại trạm quan trắc Cà Mau (mm).\n\n| Tháng | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n| Lượng mưa | 0,2 | 0,8 | 106,2 | 328,0 | 322,5 | 225,4 | 565,0 | 228,3 | 409,4 | 352,7 | 314,3 | 72,2 |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết năm 2024, tổng lượng mưa tại trạm quan trắc Cà Mau là bao nhiêu mm?',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '2925',
    unit: 'mm',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc145',
    type: 'multiple_choice',
    text: 'Thiên tai nào sau đây ở nước ta có nguồn gốc khí tượng thủy văn?',
    options: [
      'Xâm nhập mặn.',
      'Động đất.',
      'Thủy triều đỏ.',
      'Dịch bệnh.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên tai và biện pháp phòng chống',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc146',
    type: 'multiple_choice',
    text: 'Nước ta phát triển nhiều loại hình du lịch khác nhau nhằm mục đích chủ yếu là',
    options: [
      'giữ gìn cảnh quan, tăng khả năng cạnh tranh.',
      'thúc đẩy sản xuất, chuyển dịch cơ cấu kinh tế.',
      'đáp ứng thị trường, khai thác các thế mạnh.',
      'sử dụng hợp lí tài nguyên, tạo nhiều việc làm.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Thương mại và du lịch',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc147',
    type: 'multiple_choice',
    text: 'Ở nước ta, điều kiện tự nhiên thuận lợi nhất cho nuôi trồng thuỷ sản nước ngọt là',
    options: [
      'bãi triều, sông suối.',
      'kênh rạch, vũng vịnh.',
      'đầm phá, vũng vịnh.',
      'ao hồ, sông suối.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc148',
    type: 'multiple_choice',
    text: 'Cho biểu đồ Cơ cấu dân số theo tuổi nước ta năm 2009 và năm 2024. Nhận xét nào sau đây đúng với biểu đồ trên?',
    options: [
      'Năm 2024 so với năm 2009, tỉ lệ nhóm 0-14 tuổi giảm hơn 10%.',
      'Từ năm 2009 đến năm 2024, tỉ lệ nhóm 15-64 tuổi tăng nhiều nhất.',
      'Năm 2024 so với năm 2009, tỉ lệ nhóm 0-14 tuổi và nhóm 15-64 tuổi đều tăng.',
      'So với năm 2009, tỉ lệ nhóm 15-64 tuổi năm 2024 luôn cao nhất nhưng giảm.'
    ],
    correctAnswerIndex: 1,
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc149',
    type: 'multiple_choice',
    text: 'Tình trạng ô nhiễm bụi ở nông thôn nước ta chủ yếu do',
    options: [
      'hoạt động đốt phế phẩm nông nghiệp.',
      'khói bụi từ các phương tiện giao thông.',
      'khí thải từ quá trình đốt các nhiên liệu.',
      'vấn đề tồn lưu hóa chất bảo vệ thực vật.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sử dụng và bảo vệ tài nguyên thiên nhiên, môi trường',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc150',
    type: 'multiple_choice',
    text: 'Ngành công nghiệp nào sau đây không phát triển ở khu vực đồi núi nước ta?',
    options: [
      'Sản xuất điện gió.',
      'Khai thác dầu khí.',
      'Chế biến lâm sản.',
      'Khai thác than đá.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc151',
    type: 'multiple_choice',
    text: 'Dân số của nước ta hiện nay có đặc điểm nào sau đây?',
    options: [
      'Dân số ở nông thôn ít hơn thành thị.',
      'Dân cư sinh sống chủ yếu ở vùng núi.',
      'Tỉ lệ dân thành thị cao hơn nông thôn.',
      'Mật độ dân số khác nhau giữa các vùng.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc152',
    type: 'multiple_choice',
    text: 'Nguồn lao động của nước ta hiện nay có đặc điểm nào sau đây?',
    options: [
      'Ít kinh nghiệm sản xuất nông nghiệp.',
      'Phân bố đồng đều giữa các vùng.',
      'Tỉ lệ lao động nông thôn tăng nhanh.',
      'Chất lượng ngày càng được nâng lên.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc153',
    type: 'multiple_choice',
    text: 'Công nghiệp sản xuất sản phẩm điện tử, máy vi tính của nước ta phát triển nhanh chủ yếu do',
    options: [
      'lao động có trình độ, thu hút vốn đầu tư nước ngoài.',
      'khoa học công nghệ phát triển, vị trí địa lí thuận lợi.',
      'lao động nhiều kinh nghiệm, giàu tài nguyên thiên nhiên.',
      'cơ sở hạ tầng khá hoàn thiện, dân cư đô thị nhiều.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc154',
    type: 'multiple_choice',
    text: 'Ngành viễn thông nước ta hiện nay',
    options: [
      'phát triển theo hướng hiện đại.',
      'gồm nhiều bưu điện văn hoá xã.',
      'chủ yếu phát triển ở miền núi.',
      'chưa sử dụng hệ thống vệ tinh.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc155',
    type: 'multiple_choice',
    text: 'Địa hình và đất ở khu vực đồi núi của nước ta không thuận lợi cho phát triển',
    options: [
      'chăn nuôi gia súc lớn.',
      'các loại cây dược liệu.',
      'chuyên canh cây lúa gạo.',
      'cây công nghiệp lâu năm.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí tự nhiên',
    lesson: 'Đặc điểm chung của tự nhiên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc156',
    type: 'multiple_choice',
    text: 'Ở nước ta hiện nay, điều kiện thuận lợi chủ yếu để phát triển chăn nuôi gia súc lớn theo hướng hàng hóa là',
    options: [
      'có truyền thống chăn nuôi lâu đời, vốn đầu tư lớn, dịch vụ thú y được đảm bảo.',
      'nguồn thức ăn được đảm bảo, kĩ thuật – công nghệ tiên tiến, nhu cầu tiêu thụ tăng.',
      'thị trường tiêu thụ lớn, giao thông thuận lợi, chất lượng lao động ngày càng cao.',
      'nguồn thức ăn tự nhiên phong phú, dân số đông, cơ sở vật chất – kĩ thuật hiện đại.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc157',
    type: 'multiple_choice',
    text: 'Mưa vào mùa hạ nước ta chủ yếu là do tác động kết hợp của',
    options: [
      'gió mùa tây nam và dải hội tụ nhiệt đới.',
      'Tín phong Đông Bắc và dải hội tụ nhiệt đới.',
      'gió tây nam từ Bắc Ấn Độ Dương và bão.',
      'gió hướng đông bắc và hoạt động của bão.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc158',
    type: 'multiple_choice',
    text: 'Đô thị nước ta hiện nay',
    options: [
      'có tỉ lệ thiếu việc làm rất cao.',
      'cơ sở hạ tầng rất hoàn thiện.',
      'đang thu hút mạnh vốn đầu tư.',
      'chiếm phần lớn dân cư cả nước.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí dân cư',
    lesson: 'Đô thị hoá',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc159',
    type: 'multiple_choice',
    text: 'Điểm cực Bắc trên đất liền của nước ta hiện nay thuộc tỉnh',
    options: [
      'Khánh Hòa.',
      'Điện Biên.',
      'Cà Mau.',
      'Tuyên Quang.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí tự nhiên',
    lesson: 'Vị trí địa lí và phạm vi lãnh thổ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc160',
    type: 'multiple_choice',
    text: 'Đất feralit ở nước ta thường bị chua do nguyên nhân chủ yếu nào sau đây?',
    options: [
      'Quá trình phong hóa hóa học diễn ra mạnh.',
      'Khí hậu phân hóa mùa mưa - khô sâu sắc.',
      'Mưa nhiều, rửa trôi các chất ba-dơ dễ tan.',
      'Mưa nhiều, tích tụ ô-xít sắt và ô-xit nhôm.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc161',
    type: 'multiple_choice',
    text: 'Giao thông đường biển của nước ta hiện nay có khối lượng hàng hóa luân chuyển lớn nhất do nguyên nhân chủ yếu nào sau đây?',
    options: [
      'Ngoại thương phát triển nhanh, đẩy mạnh hợp tác quốc tế.',
      'Dễ dàng vận chuyển khắp thế giới, chi phí vận tải thấp.',
      'Thời gian vận chuyển nhanh, cơ cấu hàng hóa đa dạng.',
      'Chủ yếu vận tải hàng hóa nặng, cồng kềnh với giá thành rẻ.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc162',
    type: 'multiple_choice',
    text: 'Ý nghĩa xã hội của sự chuyển dịch cơ cấu kinh tế đang diễn ra ở nước ta là',
    options: [
      'nâng cao chất lượng cuộc sống.',
      'bảo vệ tài nguyên, môi trường.',
      'sử dụng hợp lí các nguồn lực.',
      'thúc đẩy tăng trưởng kinh tế.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'tf39',
    type: 'true_false',
    text: 'Cho thông tin sau:\nNông nghiệp nước ta đang phát triển mạnh theo hướng sản xuất hàng hoá tập trung, quy mô lớn; hướng tới nông nghiệp thông minh, nông nghiệp bền vững; tham gia ngày càng sâu vào chuỗi giá trị toàn cầu.',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf39_a', text: 'a) Để tham gia ngày càng sâu vào chuỗi giá trị toàn cầu, nước ta chỉ tập trung phát triển các sản phẩm nông nghiệp nhiệt đới có giá trị xuất khẩu cao.', isTrue: false },
      { id: 'tf39_b', text: 'b) Nước ta đã hình thành nhiều vùng chuyên canh cây công nghiệp và cây lương thực, thực phẩm quy mô lớn.', isTrue: true },
      { id: 'tf39_c', text: 'c) Các thành tựu của cuộc cách mạng công nghiệp lần thứ tư (4.0) tạo điều kiện thuận lợi để phát triển nông nghiệp thông minh ở nước ta.', isTrue: true },
      { id: 'tf39_d', text: 'd) Tăng cường ứng dụng khoa học – công nghệ và thu hút đầu tư là giải pháp quan trọng nhằm đẩy mạnh phát triển nông nghiệp theo hướng sản xuất hàng hoá tập trung, đáp ứng nhu cầu thị trường.', isTrue: true }
    ]
  },
  {
    id: 'tf40',
    type: 'true_false',
    text: 'Cho thông tin sau:\nCơ cấu ngành công nghiệp nước ta hiện nay tương đối đa dạng, có sự chuyển dịch theo hướng giảm tỉ trọng nhóm công nghiệp khai khoáng, tăng tỉ trọng nhóm ngành chế biến, chế tạo. Xu hướng này phù hợp với chiến lược phát triển kinh tế theo hướng công nghiệp hóa, hiện đại hóa và nền kinh tế tri thức.',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf40_a', text: 'a) Tỉ trọng giá trị sản xuất của nhóm ngành chế biến, chế tạo tăng là chủ yếu do có sự phát triển theo hướng tiếp cận công nghệ tiên tiến, hiện đại.', isTrue: true },
      { id: 'tf40_b', text: 'b) Cơ cấu ngành công nghiệp nước ta hiện nay đang chuyển dịch theo hướng tích cực.', isTrue: true },
      { id: 'tf40_c', text: 'c) Sự chuyển dịch cơ cấu công nghiệp theo ngành ở nước ta hiện nay là kết quả của quá trình tái cấu trúc, nội địa hóa sản phẩm, phát triển công nghiệp xanh và hội nhập quốc tế.', isTrue: true },
      { id: 'tf40_d', text: 'd) Xu hướng chuyển dịch cơ cấu ngành công nghiệp nước ta hiện nay chú trọng phát triển các ngành mũi nhọn để đáp ứng nhu cầu trong nước.', isTrue: false }
    ]
  },
  {
    id: 'tf41',
    type: 'true_false',
    text: 'Cho thông tin sau:\nSự phân hoá của thiên nhiên theo chiều đông – tây được thể hiện khá rõ ở vùng đồi núi nước ta. Vùng núi Đông Bắc là nơi có mùa đông lạnh nhất cả nước, về mùa đông nhiệt độ hạ xuống rất thấp, thời tiết hanh khô, thiên nhiên mang tính chất cận nhiệt đới gió mùa. Vùng núi Tây Bắc có mùa đông tương đối ấm và khô hanh, ở các vùng núi thấp cảnh quan mang tính chất nhiệt đới gió mùa, tuy nhiên ở các vùng núi cao cảnh quan thiên nhiên lại giống vùng ôn đới.',
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf41_a', text: 'a) Dãy Hoàng Liên Sơn ngăn cản ảnh hưởng của gió mùa Đông Bắc làm cho mùa đông ở vùng núi Tây Bắc đến muộn, tương đối ấm và khô hanh.', isTrue: true },
      { id: 'tf41_b', text: 'b) Sự phân hoá của thiên nhiên theo chiều đông – tây ở vùng núi nước ta chủ yếu do tác động của gió mùa và hướng của các dãy núi.', isTrue: true },
      { id: 'tf41_c', text: 'c) Vùng núi Đông Bắc có mùa đông lạnh nhất do địa hình cao nhất cả nước với hướng núi vòng cung đón gió mùa Đông Bắc.', isTrue: false },
      { id: 'tf41_d', text: 'd) Vùng núi Tây Bắc và vùng núi Đông Bắc có sự khác biệt về khí hậu và cảnh quan thiên nhiên.', isTrue: true }
    ]
  },
  {
    id: 'tf42',
    type: 'true_false',
    text: 'Cho biểu đồ Trị giá xuất khẩu, nhập khẩu của một số quốc gia Đông Nam Á, năm 2024. Nhận xét các phát biểu sau:',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Khu vực Đông Nam Á',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf42_a', text: 'a) Cán cân xuất nhập khẩu của Xin-ga-po cao hơn Thái Lan.', isTrue: true },
      { id: 'tf42_b', text: 'b) Xin-ga-po là nước có cán cân thương mại xuất siêu còn Ma-lai-xi-a và Thái Lan là nhập siêu.', isTrue: false },
      { id: 'tf42_c', text: 'c) Tổng trị giá xuất khẩu và nhập khẩu của Xin-ga-po gấp 1,7 lần tổng trị giá xuất khẩu và nhập khẩu của Ma-lai-xi-a.', isTrue: false },
      { id: 'tf42_d', text: 'd) Trị giá nhập khẩu của Xin-ga-po cao nhất, Ma-lai-xi-a thấp nhất.', isTrue: true }
    ]
  },
  {
    id: 'sa51',
    type: 'short_answer',
    text: 'Năm 2024, dân số nam nước ta là 50 576,9 nghìn người, dân số nữ là 50 766,9 nghìn người. Hãy cho biết tỉ lệ giới tính nam của nước ta năm 2024 là bao nhiêu phần trăm (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    correctAnswer: '49.9',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa52',
    type: 'short_answer',
    text: 'Năm 2024, diện tích gieo trồng lúa của nước ta là 7 127,1 nghìn ha; năng suất lúa là 61,0 tạ/ha. Hãy cho biết năm 2024, sản lượng lúa là bao nhiêu triệu tấn (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    correctAnswer: '43.5',
    unit: 'triệu tấn',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa53',
    type: 'short_answer',
    text: 'Năm 2015, khối lượng hàng hoá vận chuyển của ngành đường bộ nước ta là 882 628,4 nghìn tấn, năm 2024 là 2 029 952,7 nghìn tấn. Hãy cho biết tốc độ tăng trưởng khối lượng hàng hoá vận chuyển của ngành đường bộ nước ta năm 2024 so với năm 2015 là bao nhiêu phần trăm (lấy năm 2015 = 100%) (làm tròn kết quả đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    correctAnswer: '230',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa54',
    type: 'short_answer',
    text: 'Năm 2024, tổng sản phẩm trong nước của nước ta là 11 511,9 nghìn tỉ đồng. Trong đó, tỉ trọng khu vực nông nghiệp, lâm nghiệp, thuỷ sản là 11,9%. Hãy cho biết năm 2024, giá trị của khu vực nông nghiệp, lâm nghiệp, thuỷ sản của nước ta là bao nhiêu nghìn tỉ đồng (làm tròn kết quả đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    correctAnswer: '1370',
    unit: 'nghìn tỉ đồng',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa55',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Giá trị và cơ cấu giá trị sản xuất công nghiệp theo nhóm ngành ở nước ta năm 2022 và 2024.\n\n| Năm | 2022 | 2024 |\n|---|---|---|\n| Giá trị sản xuất công nghiệp (nghìn tỉ đồng) | 3050,0 | 3640,1 |\n| Cơ cấu ngành khai khoáng (%) | 8,8 | 7,9 |\n\nCăn cứ vào bảng số liệu, hãy cho biết giá trị sản xuất công nghiệp của nhóm ngành khai khoáng ở nước ta năm 2024 so với năm 2022 đã tăng thêm bao nhiêu nghìn tỉ đồng (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển công nghiệp',
    correctAnswer: '19.2',
    unit: 'nghìn tỉ đồng',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa56',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Nhiệt độ các tháng năm 2024 tại trạm quan trắc Láng (Hà Nội) và trạm quan trắc Huế (°C).\n\n| Trạm | Tháng 1 |\n|---|---|\n| Láng | 18,2 |\n| Huế | 19,0 |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết nhiệt độ của tháng có nhiệt độ thấp nhất tại trạm quan trắc Láng (Hà Nội) thấp hơn nhiệt độ của tháng có nhiệt độ thấp nhất tại trạm quan trắc Huế năm 2024 là bao nhiêu °C (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '0.8',
    unit: '°C',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc163',
    type: 'multiple_choice',
    text: 'Nhân tố nào dưới đây là động lực phát triển các ngành dịch vụ ở nước ta?',
    options: [
      'Thị trường.',
      'Dân cư và nguồn lao động.',
      'Trình độ phát triển kinh tế.',
      'Chính sách.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Thương mại và du lịch',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc164',
    type: 'multiple_choice',
    text: 'Các khu công nghiệp ở nước ta tập trung nhiều nhất ở đâu?',
    options: [
      'Vùng Đông Nam Bộ và Đồng bằng sông Hồng.',
      'Vùng Bắc Trung Bộ và Nam Trung Bộ.',
      'Vùng Đồng bằng sông Hồng và Bắc Trung Bộ.',
      'Vùng Nam Trung Bộ và Đông Nam Bộ.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Tổ chức lãnh thổ công nghiệp',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc165',
    type: 'multiple_choice',
    text: 'Tỉ trọng công nghiệp khai khoáng giảm trong cơ cấu giá trị sản xuất công nghiệp nước ta chủ yếu là do',
    options: [
      'chính sách của Nhà nước sử dụng tiết kiệm tài nguyên.',
      'không đáp ứng nhu cầu thị trường, tốn nhiều chi phí.',
      'nguồn tài nguyên suy giảm, thiếu lực lượng lao động.',
      'thiếu vốn đầu tư, tài nguyên cạn kiệt, thiếu lao động.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc166',
    type: 'multiple_choice',
    text: 'Phát biểu nào sau đây không đúng về du lịch biển đảo ở nước ta hiện nay?',
    options: [
      'Phân bố đều khắp cả nước.',
      'Doanh thu ngày càng tăng.',
      'Số du khách ngày càng đông.',
      'Có nhiều trung tâm nổi tiếng.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Thương mại và du lịch',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc167',
    type: 'multiple_choice',
    text: 'Phát biểu nào sau đây đúng với giao thông đường ô tô ở nước ta?',
    options: [
      'Chỉ tập trung ở dải đồng bằng ven biển.',
      'Mạng lưới ngày càng được mở rộng.',
      'Hầu hết các phương tiện lạc hậu, cũ kĩ.',
      'Chưa hội nhập vào đường xuyên Á.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc168',
    type: 'multiple_choice',
    text: 'Thiên nhiên phần lãnh thổ phía Nam nước ta mang sắc thái của vùng khí hậu',
    options: [
      'cận xích đạo gió mùa.',
      'nhiệt đới gió mùa.',
      'ôn đới gió mùa.',
      'cận nhiệt đới gió mùa.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc169',
    type: 'multiple_choice',
    text: 'Nước ta nằm trong khu vực gió mùa Châu Á nên',
    options: [
      'lượng mưa lớn, độ ẩm cao.',
      'khí hậu có hai mùa rõ rệt.',
      'nhiệt độ trung bình năm cao.',
      'nắng nhiều, tổng bức xạ lớn.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc170',
    type: 'multiple_choice',
    text: 'Ngập lụt ở nước ta',
    options: [
      'tập trung tại vùng đồi núi.',
      'hoàn toàn do triều cường.',
      'chỉ ảnh hưởng đến sản xuất.',
      'xảy ra trong mùa mưa.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên tai và biện pháp phòng chống',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc171',
    type: 'multiple_choice',
    text: 'Thế mạnh chủ yếu để phát triển công nghiệp dệt và sản xuất trang phục ở nước ta là',
    options: [
      'nguồn vốn lớn.',
      'cơ sở vật chất hiện đại.',
      'năng lượng điện lớn.',
      'lao động đông.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc172',
    type: 'multiple_choice',
    text: 'Sự chuyển dịch cơ cấu kinh tế theo lãnh thổ ở nước ta có biểu hiện nào sau đây?',
    options: [
      'Ngành nông - lâm - ngư nghiệp giảm tỉ trọng.',
      'Nhà nước quản lí các ngành kinh tế then chốt.',
      'Xuất hiện nhiều khu công nghiệp quy mô lớn.',
      'Ngành công nghiệp và xây dựng tăng tỉ trọng.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc173',
    type: 'multiple_choice',
    text: 'Các đô thị ở nước ta hiện nay',
    options: [
      'tập trung đa số dân cư cả nước.',
      'có tỉ lệ thiếu việc làm rất cao.',
      'có thị trường tiêu thụ đa dạng.',
      'chủ yếu là kinh tế nông nghiệp.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí dân cư',
    lesson: 'Đô thị hoá',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc174',
    type: 'multiple_choice',
    text: 'Vùng đồng bằng Bắc Bộ có một mùa ít mưa chủ yếu do tác động của các nhân tố nào sau đây?',
    options: [
      'Gió mùa Đông Bắc, frông, bão và áp thấp nhiệt đới.',
      'Gió mùa Đông Bắc, frông và địa hình cao ở rìa tây bắc.',
      'Tín phong bán cầu Bắc, giáp biển và địa hình thấp.',
      'Tín phong bán cầu Bắc, gió mùa Đông Bắc và frông.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'mc175',
    type: 'multiple_choice',
    text: 'Phát biểu nào sau đây đúng với ngành trồng trọt nước ta?',
    options: [
      'Cây lương thực, cây công nghiệp, ăn quả tăng nhanh tỉ trọng.',
      'Chiếm tỉ trọng cao trong cơ cấu giá trị sản xuất nông nghiệp.',
      'Cây công nghiệp, rau đậu, cây ăn quả chiếm tỉ trọng chủ yếu.',
      'Cơ cấu giá trị sản xuất ngành trồng trọt tăng nhanh liên tục.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc176',
    type: 'multiple_choice',
    text: 'Phát biểu nào sau đây đúng với tổ chức lãnh thổ nông nghiệp nước ta?',
    options: [
      'Đồng bằng sông Hồng là vùng chuyên canh lương thực số 1.',
      'Cơ cấu trang trại theo lĩnh vực hoạt động không thay đổi.',
      'Hai vùng đồng bằng lớn có số lượng trang trại nhiều nhất.',
      'Loại hình trang trại trồng trọt chiếm tỉ lệ lớn nhất hiện nay.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Tổ chức lãnh thổ nông nghiệp',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc177',
    type: 'multiple_choice',
    text: 'Cơ cấu dân số theo nhóm tuổi của nước ta đang có sự biến đổi nhanh chóng chủ yếu do',
    options: [
      'phát triển giáo dục và nâng cao mức sống.',
      'thực hiện chính sách dân số, tăng tuổi thọ.',
      'dân số trẻ, nguồn lao động tăng rất nhanh.',
      'quy mô dân số tăng nhanh, lao động đông.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc178',
    type: 'multiple_choice',
    text: 'Nguồn lao động nước ta hiện nay có đặc điểm nào sau đây?',
    options: [
      'Chất lượng nâng lên.',
      'Số lượng không lớn.',
      'Trình độ rất cao.',
      'Sự phân bố đều.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc179',
    type: 'multiple_choice',
    text: 'Khu vực nào sau đây ở nước ta không thích hợp cho nuôi trồng thủy sản nước lợ?',
    options: [
      'Đầm phá.',
      'Bãi triều.',
      'Rừng ngập mặn.',
      'Ô trũng ở đồng bằng.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'tf43',
    type: 'true_false',
    text: 'Cho bảng số liệu: Cơ cấu lao động từ 15 tuổi trở lên phân theo thành thị và nông thôn của nước ta, giai đoạn 2000 - 2023 (Đơn vị: %).\n\n| Năm | 2000 | 2023 |\n|---|---|---|\n| Nông thôn | 71,70 | 62,63 |\n| Thành thị | 28,30 | 37,37 |',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Vận dụng',
    statements: [
      { id: 'tf43_a', text: 'a) Để thể hiện cơ cấu lao động từ 15 tuổi trở lên phân theo thành thị và nông thôn của nước ta, giai đoạn 2000 - 2023 có thể vẽ biểu đồ đường tròn, miền, cột ghép.', isTrue: false },
      { id: 'tf43_b', text: 'b) Tỉ trọng lao động khu vực thành thị tăng nhanh do quá trình công nghiệp hoá, hiện đại hoá.', isTrue: true },
      { id: 'tf43_c', text: 'c) Tỉ trọng lao động khu vực nông thôn giảm liên tục.', isTrue: true },
      { id: 'tf43_d', text: 'd) Tỉ trọng lao động khu vực thành thị tăng và rất cao.', isTrue: false }
    ]
  },
  {
    id: 'tf44',
    type: 'true_false',
    text: 'Cho thông tin sau:\nChuyển dịch cơ cấu công nghiệp theo ngành hiện nay là kết quả của quá trình tái cấu trúc, nội địa hoá sản phẩm, phát triển công nghiệp xanh, hội nhập quốc tế. Sự chuyển dịch này gắn với đổi mới mô hình tăng trưởng theo hướng công nghiệp hoá, hiện đại hoá, nâng cao năng suất lao động, giảm phụ thuộc vào khai thác tài nguyên của Việt Nam, hướng tới phát triển bển vững.',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf44_a', text: 'a) Các ngành công nghiệp nước ta ngày càng đa dạng là khai thác hiệu quả các nguồn lực trong nước.', isTrue: false },
      { id: 'tf44_b', text: 'b) Mục đích của việc chuyển dịch cơ cấu ngành công nghiệp là nâng cao trình độ phát triển kinh tế - xã hội, giải quyết nhiều việc làm.', isTrue: true },
      { id: 'tf44_c', text: 'c) Nhân tố tác động đến chuyển dịch cơ cấu ngành công nghiệp của nước ta là quá trình công nghiệp hóa, hiện đại hóa.', isTrue: true },
      { id: 'tf44_d', text: 'd) Tác động của biến đổi khí hậu dẫn đến Việt Nam cần đẩy mạnh phát triển công nghiệp xanh, công nghiệp bền vững, giảm thiểu phát thải khí nhà kính.', isTrue: true }
    ]
  },
  {
    id: 'tf45',
    type: 'true_false',
    text: 'Cho thông tin sau:\nSự phân hóa thiên nhiên ở miền đồi núi nước ta rất phức tạp. Thiên nhiên vùng núi Đông Bắc mang sắc thái cận nhiệt đới gió mùa. Vùng Tây Bắc, ở đồi núi thấp có cảnh quan thiên nhiên nhiệt đới gió mùa, nhưng núi cao có cảnh quan thiên nhiên giống như ôn đới. Khi sườn đông Trường Sơn có mưa vào thời kì thu đông, thì sườn tây (cao nguyên Nam Trung Bộ) lại là mùa khô sâu sắc và ngược lại.',
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf45_a', text: 'a) Khi cao nguyên Nam Trung Bộ bước vào mùa mưa thì nhiều nơi ở sườn đông Trường Sơn chịu tác động của gió Tây khô nóng.', isTrue: true },
      { id: 'tf45_b', text: 'b) Sự phân hóa thiên nhiên ở miền đồi núi nước ta chủ yếu là do tác động của gió đông bắc với độ cao địa hình.', isTrue: false },
      { id: 'tf45_c', text: 'c) Thiên nhiên miền đồi núi nước ta có phân hoá theo đông - tây.', isTrue: true },
      { id: 'tf45_d', text: 'd) Vùng núi cao Tây Bắc có cảnh quan thiên nhiên nhiệt đới.', isTrue: false }
    ]
  },
  {
    id: 'tf46',
    type: 'true_false',
    text: 'Cho thông tin sau:\nSản phẩm thuỷ sản ngày càng đáp ứng yêu cầu về an toàn thực phẩm, truy xuất nguồn gốc và các tiêu chuẩn quốc tế. Nhiều sản phẩm thuỷ sản nuôi trồng đã qua chế biến của nước ta được xuất khẩu đến các thị trường lớn trên thế giới như Hoa Kỳ, EU, Nhật Bản,...Vùng nuôi trồng thuỷ sản lớn nhất nước ta là vùng Đồng bằng sông Cửu Long (chiếm 69,8% sản lượng nuôi trồng thuỷ sản của cả nước), đứng thứ hai là vùng Đồng bằng sông Hồng (chiếm 17,3%, năm 2021).',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf46_a', text: 'a) Việc mở rộng thị trường xuất khẩu thủy sản giúp ổn định sản xuất, phát huy lợi thế, nâng cao vị thế của đất nước trên trường quốc tế.', isTrue: true },
      { id: 'tf46_b', text: 'b) Vùng Đồng bằng sông Cửu Long có hoạt động thủy sản cả khai thác và nuôi trồng phát triển nhất cả nước do có nhiều điều kiện thuận lợi về tự nhiên và kinh tế - xã hội.', isTrue: true },
      { id: 'tf46_c', text: 'c) Ngành nuôi trồng thủy sản đã tạo ra nhiều mặt hàng xuất khẩu, trong đó quan trọng là tôm.', isTrue: true },
      { id: 'tf46_d', text: 'd) Lợi thế giúp thủy sản nuôi trồng được chú trọng hơn khai thác là chủ động hơn với nhu cầu của thị trường.', isTrue: true }
    ]
  },
  {
    id: 'sa57',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Khối lượng hàng hoá vận chuyển của cả nước và ngành vận tải đường bộ năm 2010 và năm 2023 (Đơn vị: nghìn tấn).\n\n| Tiêu chí | 2010 | 2023 |\n|---|---|---|\n| Tổng số | 800 886,0 | 2 351 241,7 |\n| Trong đó: Đường bộ | 587 014,2 | 1 842 204,1 |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết tỉ trọng khối lượng hàng hoá vận chuyển bằng đường bộ năm 2023 lớn hơn tỉ trọng khối lượng hàng hóa vận chuyển bằng đường bộ năm 2010 bao nhiêu %? (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    correctAnswer: '5.1',
    unit: '%',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa58',
    type: 'short_answer',
    text: 'Năm 2025, dân số của nước ta là 102,3 triệu người, tỉ lệ dân nông thôn là 61,4%. Hãy cho biết dân số nông thôn của nước ta năm 2025 là bao nhiêu triệu người? (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    correctAnswer: '62.8',
    unit: 'triệu người',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa59',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Lượng mưa trung bình hàng tháng năm 2023 tại trạm quan trắc Quy Nhơn (mm).\n\n| Trạm | Tháng 4 | Tháng 10 |\n|---|---|---|\n| Quy Nhơn | 10,6 | 449,2 |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết chênh lệch lượng mưa tháng lớn nhất và nhỏ nhất của Quy Nhơn là bao nhiêu mm? (làm tròn kết quả đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '439',
    unit: 'mm',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa60',
    type: 'short_answer',
    text: 'Năm 2025, trị giá xuất khẩu nước ta là 475,1 tỉ USD, trị giá nhập khẩu của nước ta là 455,0 tỉ USD. Hãy cho biết cán cân xuất nhập khẩu của nước ta năm 2025 là bao nhiêu tỉ USD. (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Thương mại và du lịch',
    correctAnswer: '20.1',
    unit: 'tỉ USD',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa61',
    type: 'short_answer',
    text: 'Cho bảng số liệu: Nhiệt độ không khí trung bình các tháng trong năm 2023 tại trạm quan trắc Huế (°C).\n\n| Trạm | Tháng 1 | Tháng 8 |\n|---|---|---|\n| Huế | 19,0 | 30,4 |\n\nCăn cứ vào bảng số liệu trên, hãy cho biết biên độ nhiệt năm 2023 của trạm quan trắc Huế là bao nhiêu °C? (làm tròn kết quả đến một chữ số thập phân).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Đặc điểm chung của tự nhiên',
    correctAnswer: '11.4',
    unit: '°C',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa62',
    type: 'short_answer',
    text: 'Năm 2025, nước ta có sản lượng điện đạt 287,9 tỉ kWh, dân số là 102,3 triệu người. Hãy cho biết, sản lượng điện bình quân đầu người năm 2025 của nước ta là bao nhiêu kWh/người (làm tròn kết quả đến hàng đơn vị).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển công nghiệp',
    correctAnswer: '2814',
    unit: 'kWh/người',
    cognitiveLevel: 'Vận dụng'
  },
  // --- BỔ SUNG: GIAO THÔNG VẬN TẢI VÀ BƯU CHÍNH VIỄN THÔNG ---
  {
    id: 'gtvt_mc1',
    type: 'multiple_choice',
    text: 'Nhân tố nào sau đây giúp nước ta thuận lợi hơn trong việc mở rộng các mối quan hệ để phát triển các ngành dịch vụ?',
    options: ['Lao động.', 'Thị trường.', 'Vị trí địa lí.', 'Khoáng sản.'],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'gtvt_mc2',
    type: 'multiple_choice',
    text: 'Nhân tố nào sau đây ảnh hưởng lớn nhất tới việc thi công và hoạt động của các tuyến đường bộ ở nước ta?',
    options: ['Dân cư.', 'Thị trường.', 'Khí hậu.', 'Địa hình.'],
    correctAnswerIndex: 3,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'gtvt_mc3',
    type: 'multiple_choice',
    text: 'Nhân tố nào sau đây là chủ yếu để giúp cho hoạt động dịch vụ nước ta diễn ra quanh năm?',
    options: ['Dân cư.', 'Khí hậu.', 'Vị trí.', 'Địa hình.'],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'gtvt_mc4',
    type: 'multiple_choice',
    text: 'Nhân tố nào sau đây là chủ yếu tạo ra điều kiện thuận lợi để nước ta phát triển giao thông đường thủy nội địa?',
    options: ['Sông hồ.', 'Khí hậu.', 'Vị trí.', 'Địa hình.'],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'gtvt_mc5',
    type: 'multiple_choice',
    text: 'Khu vực nào sau đây có có hoạt động dịch vụ da dạng và phát triển mạnh mẽ nhất?',
    options: ['Nông thôn.', 'Thành phố.', 'Hải đảo.', 'Miền núi.'],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'gtvt_mc6',
    type: 'multiple_choice',
    text: 'Vùng nào sau đây có số dân đông, chất lượng cuộc sống cao là động lực của ngành dịch vụ?',
    options: ['Nam Trung Bộ.', 'Bắc Trung Bộ.', 'Trung du và miền núi phía Bắc.', 'Đông Nam Bộ.'],
    correctAnswerIndex: 3,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'gtvt_mc7',
    type: 'multiple_choice',
    text: 'Nhân tố nào sau đây ảnh hưởng quyết định đến việc mở rộng quy mô dịch vụ nước ta?',
    options: ['Dân cư.', 'Thị trường.', 'Trình độ phát triển kinh tế.', 'Chính sách.'],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'gtvt_mc8',
    type: 'multiple_choice',
    text: 'Nhân tố nào sau đây là động lực phát triển các ngành dịch vụ?',
    options: ['Dân cư.', 'Thị trường.', 'Nông nghiệp.', 'Chính sách.'],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'gtvt_mc9',
    type: 'multiple_choice',
    text: 'Nhân tố nào sau đây thúc đẩy việc nâng cao chất lượng dịch vụ mà mở rộng loại hình dịch vụ?',
    options: ['Lao động.', 'Thị trường.', 'Ngành kinh tế.', 'Vị trí địa lí.'],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'gtvt_mc10',
    type: 'multiple_choice',
    text: 'Nhân tố nào sau đây là chủ yếu để góp phần thu hút vốn đầu tư và nâng cao chất lượng, hiệu quả dịch vụ?',
    options: ['Dân cư.', 'Thị trường.', 'Cơ sở vật chất - kĩ thuật.', 'Vị trí địa lí.'],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'gtvt_tf1',
    type: 'true_false',
    text: 'Cho bảng số liệu: Khối lượng vận chuyển và luân chuyển hàng hóa của các phương tiện vận tải của Việt Nam, năm 2024.',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'gtvt_tf1_a', text: 'a) Đường hàng không có khối lượng vận chuyển và khối lượng luân chuyển lớn nhất.', isTrue: false },
      { id: 'gtvt_tf1_b', text: 'b) Đường biển có khối lượng vận chuyển lớn thứ ba và khối lượng luân chuyển lớn nhất.', isTrue: true },
      { id: 'gtvt_tf1_c', text: 'c) Biểu đồ cột là dạng biểu đồ thích hợp nhất để thể hiện cự li vận chuyển trung bình của các phương tiện vận tải nước ta năm 2024.', isTrue: true },
      { id: 'gtvt_tf1_d', text: 'd) Đường ô tô có khối lượng vận chuyển lớn nhất do phạm vi vận chuyển rộng nhất.', isTrue: true }
    ]
  },
  {
    id: 'gtvt_sa1',
    type: 'short_answer',
    text: 'Một xe ô tô vận chuyển 5 tấn hàng hoá từ Lào Cai đến Hà Nội với quãng đường 296 km. Tính khối lượng luân chuyển của xe ô tô trên. (làm tròn kết quả đến hàng đơn vị)',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    correctAnswer: '1480',
    unit: 'tấn.km',
    cognitiveLevel: 'Vận dụng'
  },
  // --- BỔ SUNG TỪ ĐỀ KHẢO SÁT CHẤT LƯỢNG 2025-2026 ---
  {
    id: 'mc180',
    type: 'multiple_choice',
    text: 'Công nghiệp sản xuất, chế biến thực phẩm nước ta thường phân bố ở',
    options: ['vùng nông thôn.', 'vùng nguyên liệu.', 'các thành phố.', 'ven khu công nghiệp.'],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc181',
    type: 'multiple_choice',
    text: 'Khí hậu miền Nam Trung Bộ và Nam Bộ khác với miền Bắc và Đông Bắc Bắc Bộ chủ yếu do tác động của',
    options: [
      'gió đông bắc và tây nam, hai lần Mặt Trời lên thiên đỉnh, vị trí gần xích đạo.',
      'gió mùa đông, vị trí trong vùng nội chí tuyến, bão và dải hội tụ nhiệt đới.',
      'vị trí nằm gần bán cầu Nam, thời gian Mặt Trời lên thiên đỉnh, gió mùa hạ.',
      'vị trí nằm xa chí tuyến, Tín phong bán cầu Bắc, gió mùa Tây Nam và bão.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc182',
    type: 'multiple_choice',
    text: 'Ý nghĩa chủ yếu về mặt kinh tế của chuyển dịch cơ cấu kinh tế ở nước ta là',
    options: [
      'thúc đẩy tăng trưởng kinh tế dựa trên tài nguyên.',
      'nâng cao trình độ và tăng năng suất của lao động.',
      'khai thác và sử dụng hợp lí tài nguyên thiên nhiên.',
      'tái cơ cấu nền kinh tế theo hướng hiệu quả hơn.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc183',
    type: 'multiple_choice',
    text: 'Chăn nuôi gia súc ăn cỏ của nước ta hiện nay',
    options: [
      'số lượng đàn trâu tăng liên tục.',
      'số lượng đàn bò nhiều hơn trâu.',
      'phân bố tập trung ven các đô thị.',
      'chủ yếu lấy sức kéo và lấy thịt.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc184',
    type: 'multiple_choice',
    text: 'Hạn hán ở nước ta thường gây ra hậu quả chủ yếu nào sau đây?',
    options: [
      'Làm sạt lở đất ở đồng bằng ven biển.',
      'Làm cạn kiệt và ô nhiễm nguồn nước.',
      'Tăng diện tích đất phèn ở miền núi.',
      'Gây thiệt hại nghiêm trọng về người.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên tai và biện pháp phòng chống',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc185',
    type: 'multiple_choice',
    text: 'Máy móc, thiết bị, dụng cụ phụ tùng sản xuất là các mặt hàng nhập khẩu chính ở vùng Đồng bằng sông Hồng chủ yếu nhằm',
    options: [
      'đổi mới công nghệ, khai thác triệt để tài nguyên, phục vụ nhu cầu tiêu dùng.',
      'phục vụ nhu cầu tiêu dùng, nâng cấp cơ sở hạ tầng, tăng năng suất lao động.',
      'đáp ứng nhu cầu công nghiệp hóa, hiện đại hóa, năng cao năng lực sản xuất.',
      'nâng cao mức sống, phát triển công nghiệp công nghệ cao, thu hút đầu tư.'
    ],
    correctAnswerIndex: 2,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc186',
    type: 'multiple_choice',
    text: 'Giải pháp chủ yếu nhằm nâng cao hiệu quả chăn nuôi gia súc lớn ở Trung du và miền núi phía Bắc là',
    options: [
      'mở rộng chuồng trại, phòng chống dịch bệnh.',
      'áp dụng tiến bộ kĩ thuật, chăn nuôi hàng hóa.',
      'đẩy mạnh chế biến, sử dụng nhiều giống mới.',
      'cải tạo đồng cỏ, mở rộng thị trường tiêu thụ.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Khai thác thế mạnh ở Trung du và miền núi phía Bắc',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc187',
    type: 'multiple_choice',
    text: 'Loại gió nào sau đây là nguyên nhân chính tạo nên mùa khô ở Nam Bộ nước ta?',
    options: ['Gió mùa Tây Nam.', 'Gió mùa Đông Bắc.', 'Tín phong bán cầu Bắc.', 'Tín phong bán cầu Nam.'],
    correctAnswerIndex: 2,
    topic: 'Địa lí tự nhiên',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc188',
    type: 'multiple_choice',
    text: 'Các cây trồng nào sau đây là cây lâu năm ở nước ta?',
    options: ['Mía, lạc.', 'Lúa, ngô.', 'Rau đậu.', 'Cam, xoài.'],
    correctAnswerIndex: 3,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc189',
    type: 'multiple_choice',
    text: 'Loại hình giao thông có các tuyến chính tập trung chủ yếu ở phía bắc nước ta và chủ yếu vận chuyển hàng hóa là',
    options: ['đường hàng không.', 'đường biển.', 'đường sắt.', 'đường ô tô.'],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc190',
    type: 'multiple_choice',
    text: 'Vị trí địa lí nước ta có đặc điểm nào sau đây?',
    options: [
      'Có chung Biển Đông với Lào và Cam-pu-chia.',
      'Nằm trong vùng nội chí tuyến bán cầu Nam.',
      'Ít chịu ảnh hưởng của biến đổi khí hậu toàn cầu.',
      'Nằm trên đường di cư của nhiều loài sinh vật.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí tự nhiên',
    lesson: 'Vị trí địa lí và phạm vi lãnh thổ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc191',
    type: 'multiple_choice',
    text: 'Công nghiệp dệt, may và giày, dép nước ta hiện nay',
    options: [
      'đã tạo dựng được các thương hiệu uy tín.',
      'mới được hình thành trong thời kì Đổi mới.',
      'sử dụng chủ yếu nguồn nguyên liệu tại chỗ.',
      'sản phẩm chỉ đáp ứng nhu cầu trong nước.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc192',
    type: 'multiple_choice',
    text: 'Ngành khai thác dầu khí của nước ta phân bố chủ yếu ở',
    options: ['các quần đảo.', 'vùng đồi núi.', 'vùng ven biển.', 'thềm lục địa.'],
    correctAnswerIndex: 3,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc193',
    type: 'multiple_choice',
    text: 'Khó khăn nào sau đây là chủ yếu đối với nuôi trồng thủy sản ở nước ta hiện nay?',
    options: [
      'Nhiều nơi xâm nhập mặn diễn ra rất nghiêm trọng.',
      'Dịch bệnh thường xuyên xảy ra trên diện rộng.',
      'Nguồn giống tự nhiên ở một số vùng khan hiếm.',
      'Diện tích mặt nước có xu hướng thu hẹp nhanh.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc194',
    type: 'multiple_choice',
    text: 'Dân số nước ta hiện nay có đặc điểm nào sau đây?',
    options: [
      'Tốc độ già hóa dân số đang diễn ra chậm.',
      'Tỉ lệ dân số từ 0 - 14 tuổi có xu hướng tăng.',
      'Tỉ suất gia tăng dân số tự nhiên rất cao.',
      'Cơ cấu dân số theo giới tính khá cân bằng.'
    ],
    correctAnswerIndex: 3,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc195',
    type: 'multiple_choice',
    text: 'Nguồn gây ô nhiễm bụi mịn ở các thành phố nước ta hiện nay chủ yếu từ',
    options: ['biến đổi khí hậu.', 'phương tiện giao thông.', 'rác thải sinh hoạt.', 'hoạt động xây dựng.'],
    correctAnswerIndex: 1,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sử dụng và bảo vệ tài nguyên thiên nhiên, môi trường',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc196',
    type: 'multiple_choice',
    text: 'Cơ cấu lao động theo ngành kinh tế nước ta hiện nay có đặc điểm nào sau đây?',
    options: [
      'Chuyển dịch theo hướng công nghiệp hóa.',
      'Lao động phân bố đồng đều giữa các vùng.',
      'Lao động trong ngành dịch vụ giảm liên tục.',
      'Tập trung chủ yếu trong khu vực Nhà nước.'
    ],
    correctAnswerIndex: 0,
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc197',
    type: 'multiple_choice',
    text: 'Vùng Đồng bằng sông Hồng hiện nay đứng đầu cả nước về',
    options: ['mật độ dân số.', 'diện tích tự nhiên.', 'diện tích trồng lúa.', 'sản lượng thuỷ sản.'],
    correctAnswerIndex: 0,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc198',
    type: 'multiple_choice',
    text: 'Sự phân hoá nhiệt độ theo chiều bắc - nam ở nước ta chủ yếu do tác động của',
    options: ['vị trí và độ cao địa hình.', 'hướng địa hình và gió phơn.', 'độ cao và hướng địa hình.', 'vị trí địa lí và gió mùa.'],
    correctAnswerIndex: 3,
    topic: 'Địa lí tự nhiên',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc199',
    type: 'multiple_choice',
    text: 'Sinh vật của nước ta phân hóa đa dạng chủ yếu do nguyên nhân nào sau đây?',
    options: [
      'Tài nguyên đất phong phú và phân hóa đa dạng.',
      'Khí hậu phân hóa theo vĩ độ và theo độ cao.',
      'Mạng lưới sông ngòi dày đặc và nhiều phù sa.',
      'Địa hình chủ yếu là đồi núi và phân hóa đa dạng.'
    ],
    correctAnswerIndex: 1,
    topic: 'Địa lí tự nhiên',
    lesson: 'Đặc điểm chung của tự nhiên',
    cognitiveLevel: 'Thông hiểu'
  },
  {
    id: 'mc200',
    type: 'multiple_choice',
    text: 'Miền Nam Trung Bộ và Nam Bộ dẫn đầu cả nước về loại khoáng sản nào sau đây?',
    options: ['A-pa-tit.', 'Bô-xit.', 'Than đá.', 'Đá vôi.'],
    correctAnswerIndex: 1,
    topic: 'Địa lí tự nhiên',
    lesson: 'Vị trí địa lí và phạm vi lãnh thổ',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc201',
    type: 'multiple_choice',
    text: 'Cây nào sau đây ở nước ta thuộc nhóm cây công nghiệp hàng năm?',
    options: ['Cà phê.', 'Hồ tiêu.', 'Đậu tương.', 'Cao su.'],
    correctAnswerIndex: 2,
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'mc202',
    type: 'multiple_choice',
    text: 'Tỉnh nào sau đây của vùng Trung du và miền núi phía Bắc giáp Trung Quốc?',
    options: ['Thái Nguyên.', 'Sơn La.', 'Cao Bằng.', 'Phú Thọ.'],
    correctAnswerIndex: 2,
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Khai thác thế mạnh ở Trung du và miền núi phía Bắc',
    cognitiveLevel: 'Nhận biết'
  },
  {
    id: 'tf47',
    type: 'true_false',
    text: 'Cho thông tin sau:\nHệ thống giao thông của nước ta gồm: đường bộ, đường sắt, đường thủy nội địa, đường hàng không và đường ống. Mạng lưới giao thông vận tải phân bố rộng khắp, kết nối với một số tuyến quốc tế. Trong những năm gần đây, ngành không ngừng được đầu tư và hiện đại hóa để đáp ứng nhu cầu phát triển của đất nước.',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf47_a', text: 'a) Giao thông vận tải đường biển nước ta có khối lượng luân chuyển hàng hóa lớn chủ yếu do vận chuyển hàng nặng trên các tuyến có chiều dài lớn.', isTrue: true },
      { id: 'tf47_b', text: 'b) Giải pháp chủ yếu để ngành giao thông vận tải phát triển theo hướng bền vững là nâng cao năng lực cạnh tranh của ngành thông qua huy động nguồn vốn đầu tư, hiện đại hóa, mở rộng quy mô hoạt động và đẩy mạnh ứng dụng khoa học công nghệ hiện đại.', isTrue: true },
      { id: 'tf47_c', text: 'c) Đường bộ là loại hình ra đời muộn nhất ở nước ta.', isTrue: false },
      { id: 'tf47_d', text: 'd) Nước ta có đầy đủ các loại hình giao thông vận tải.', isTrue: true }
    ]
  },
  {
    id: 'tf48',
    type: 'true_false',
    text: 'Cho thông tin sau:\nCông nghiệp là ngành kinh tế quan trọng ở vùng Đồng bằng sông Hồng. Giá trị sản xuất công nghiệp cao và tăng nhanh, cơ cấu ngành công nghiệp của vùng đa dạng, bao gồm: khai thác than; nhiệt điện; công nghiệp dệt, sản xuất trang phục; công nghiệp sản xuất, chế biến thực phẩm; công nghiệp sản xuất điện tử, máy vi tính; cơ khí chế tạo…',
    topic: 'Địa lí các vùng kinh tế - xã hội',
    lesson: 'Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
    cognitiveLevel: 'Thông hiểu',
    statements: [
      { id: 'tf48_a', text: 'a) Ngành công nghiệp sản xuất, chế biến thực phẩm phát triển ở Đồng bằng sông Hồng chủ yếu do lao động có trình độ cao, vị trí địa lí thuận lợi cho xuất, nhập khẩu hàng hóa.', isTrue: true },
      { id: 'tf48_b', text: 'b) Ngành công nghiệp có hàm lượng khoa học - công nghệ cao ở Đồng bằng sông Hồng là điện tử, máy vi tính.', isTrue: true },
      { id: 'tf48_c', text: 'c) Hiện nay, giá trị sản xuất công nghiệp ở Đồng bằng sông Hồng tăng nhanh chủ yếu do mở rộng quy mô, nâng cao năng lực sản xuất trên cơ sở thu hút mạnh đầu tư, phát triển hạ tầng và tăng cường ứng dụng khoa học – công nghệ.', isTrue: true },
      { id: 'tf48_d', text: 'd) Hướng phát triển công nghiệp ở Đồng bằng sông Hồng là đẩy mạnh các ngành công nghiệp truyền thống, các ngành có lợi thế về tài nguyên và lao động.', isTrue: false }
    ]
  },
  {
    id: 'sa63',
    type: 'short_answer',
    text: 'Năm 2024, diện tích tự nhiên nước ta là 331 338,3 km2, số dân nước ta là 101 343,8 nghìn người. Hãy cho biết mật độ dân số trung bình của nước ta năm 2024 là bao nhiêu người/km2 (làm tròn kết quả đến hàng đơn vị).',
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    correctAnswer: '306',
    unit: 'người/km2',
    cognitiveLevel: 'Vận dụng'
  },
  {
    id: 'sa64',
    type: 'short_answer',
    text: 'Năm 2024, ngành vận tải đường biển nước ta có khối lượng vận chuyển hàng hóa là 129,5 triệu tấn, khối lượng luân chuyển hàng hóa là 127 791,0 triệu tấn.km. Hãy cho biết cự li vận chuyển trung bình của đường biển nước ta năm 2024 là bao nhiêu km (làm tròn kết quả đến hàng đơn vị).',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Giao thông vận tải và bưu chính viễn thông',
    correctAnswer: '987',
    unit: 'km',
    cognitiveLevel: 'Vận dụng'
  },

  // ===== PHẦN II - LUYỆN TẬP ĐÚNG/SAI CHUẨN MA TRẬN 2025 (có bảng số liệu context) =====
  {
    id: 'tf_p2_1',
    type: 'true_false',
    text: 'Cho bảng số liệu về dân số và tỉ lệ gia tăng tự nhiên của Việt Nam qua các năm. Hãy xem xét các nhận định sau:',
    context: '**DÂN SỐ VÀ TỈ LỆ TĂNG TỰ NHIÊN VIỆT NAM**\n| Năm | Dân số (triệu người) | Tỉ lệ tăng TN (‰) |\n|---|---|---|\n| 2000 | 77,6 | 14,3 |\n| 2010 | 86,9 | 10,1 |\n| 2020 | 97,3 | 9,4 |\n| 2023 | 100,3 | 8,9 |',
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Dân số VN tăng liên tục nhờ tỉ lệ TGTN còn dương. Tỉ lệ TGTN giảm từ 14,3‰ (2000) xuống 8,9‰ (2023). TGTN giảm ≠ dân số giảm. VN vẫn trong trạng thái "dân số vàng" — lao động chiếm tỉ trọng cao.',
    tips: 'Tỉ lệ TGTN giảm = tốc độ tăng chậm lại, KHÔNG phải dân số giảm!',
    mnemonics: 'TN‰↓ nhưng vẫn dương → DS vẫn tăng, chỉ tăng chậm hơn',
    statements: [
      { id: 'tf_p2_1_a', text: 'a) Dân số Việt Nam tăng liên tục trong giai đoạn 2000–2023.', isTrue: true },
      { id: 'tf_p2_1_b', text: 'b) Tỉ lệ gia tăng tự nhiên giảm có nghĩa là dân số Việt Nam đang giảm.', isTrue: false },
      { id: 'tf_p2_1_c', text: 'c) So với năm 2000, tốc độ tăng dân số năm 2023 đã chậm lại đáng kể.', isTrue: true },
      { id: 'tf_p2_1_d', text: 'd) Năm 2023, trung bình mỗi năm dân số Việt Nam tăng thêm khoảng 1 triệu người.', isTrue: true }
    ]
  },
  {
    id: 'tf_p2_2',
    type: 'true_false',
    text: 'Cho bảng số liệu về cơ cấu kinh tế theo ngành của Việt Nam (% trong GDP). Hãy xem xét các nhận định sau:',
    context: '**CƠ CẤU GDP THEO NGÀNH KINH TẾ VIỆT NAM (%)**\n| Ngành | 2010 | 2015 | 2020 | 2023 |\n|---|---|---|---|---|\n| Nông-lâm-thủy sản | 18,4 | 17,0 | 14,8 | 11,9 |\n| Công nghiệp-Xây dựng | 32,1 | 33,3 | 33,7 | 37,1 |\n| Dịch vụ | 38,8 | 39,7 | 41,6 | 42,5 |\n| Thuế sản phẩm | 10,7 | 10,0 | 9,9 | 8,5 |',
    topic: 'Địa lí kinh tế - xã hội',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Cơ cấu GDP chuyển dịch theo hướng CNH-HĐH: NN giảm (18,4→11,9%), CN+DV tăng. Dịch vụ luôn chiếm tỉ trọng cao nhất. CN-XD vẫn chưa vượt dịch vụ khi tính riêng.',
    tips: 'Xu hướng: NN↓ + CN↑ + DV↑ = Công nghiệp hóa, Hiện đại hóa',
    mnemonics: 'NN – CN – DV theo thứ tự tăng dần tỉ trọng',
    statements: [
      { id: 'tf_p2_2_a', text: 'a) Tỉ trọng ngành nông-lâm-thủy sản trong GDP có xu hướng giảm liên tục giai đoạn 2010–2023.', isTrue: true },
      { id: 'tf_p2_2_b', text: 'b) Ngành dịch vụ luôn chiếm tỉ trọng cao nhất trong GDP (tính riêng 3 nhóm ngành chính) qua các năm.', isTrue: true },
      { id: 'tf_p2_2_c', text: 'c) Tỉ trọng ngành công nghiệp-xây dựng đã vượt ngành dịch vụ vào năm 2023.', isTrue: false },
      { id: 'tf_p2_2_d', text: 'd) Sự chuyển dịch cơ cấu kinh tế trên phản ánh quá trình công nghiệp hóa, hiện đại hóa của Việt Nam.', isTrue: true }
    ]
  },
  {
    id: 'tf_p2_3',
    type: 'true_false',
    text: 'Cho bảng số liệu về sản xuất lúa gạo của Việt Nam. Hãy xem xét các nhận định sau:',
    context: '**SẢN XUẤT LÚA GẠO VIỆT NAM**\n| Năm | Diện tích (nghìn ha) | Sản lượng (nghìn tấn) | Năng suất (tạ/ha) |\n|---|---|---|---|\n| 2000 | 7 666,3 | 32 529,5 | 42,4 |\n| 2010 | 7 513,7 | 40 005,6 | 53,2 |\n| 2020 | 7 280,4 | 42 688,7 | 58,7 |\n| 2023 | 7 119,4 | 43 493,0 | 61,1 |',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Diện tích lúa giảm nhưng năng suất và sản lượng TĂNG liên tục nhờ khoa học kỹ thuật. Vùng SX lúa chủ lực: ĐBSCL (50% diện tích, ~55% sản lượng).',
    tips: 'S↓ + NS↑ → Q tăng: ứng dụng KHKT vào sản xuất lúa',
    mnemonics: 'Diện tích nhỏ nhưng sản lượng lớn = Nông nghiệp tiên tiến',
    statements: [
      { id: 'tf_p2_3_a', text: 'a) Trong giai đoạn 2000–2023, diện tích trồng lúa của Việt Nam có xu hướng giảm.', isTrue: true },
      { id: 'tf_p2_3_b', text: 'b) Sản lượng lúa giảm do diện tích trồng lúa bị thu hẹp trong giai đoạn 2000–2023.', isTrue: false },
      { id: 'tf_p2_3_c', text: 'c) Năng suất lúa tăng liên tục phản ánh việc áp dụng khoa học - kỹ thuật vào sản xuất.', isTrue: true },
      { id: 'tf_p2_3_d', text: 'd) Việt Nam là một trong những quốc gia xuất khẩu gạo hàng đầu thế giới.', isTrue: true }
    ]
  },
  {
    id: 'tf_p2_4',
    type: 'true_false',
    text: 'Cho bảng số liệu về GDP và dân số một số nước Đông Nam Á năm 2023. Hãy xem xét các nhận định sau:',
    context: '**GDP VÀ DÂN SỐ MỘT SỐ NƯỚC ĐÔNG NAM Á (2023)**\n| Quốc gia | Dân số (triệu người) | GDP (tỉ USD) | GDP/người (USD) |\n|---|---|---|---|\n| In-đô-nê-xi-a | 277,5 | 1 371,2 | 4 942 |\n| Thái Lan | 71,8 | 574,3 | 7 997 |\n| Phi-líp-pin | 116,7 | 435,7 | 3 731 |\n| Việt Nam | 100,3 | 430,0 | 4 287 |\n| Ma-lai-xi-a | 33,6 | 399,6 | 11 897 |',
    topic: 'Địa lí Đông Nam Á (Lớp 11)',
    lesson: 'Khu vực Đông Nam Á',
    cognitiveLevel: 'Vận dụng',
    explanation: 'In-đô-nê-xi-a có GDP lớn nhất (1 371,2 tỉ USD). Ma-lai-xi-a có GDP/người cao nhất (11 897 USD). VN có GDP gần Phi-líp-pin nhưng GDP/người của VN cao hơn Phi-líp-pin vì VN ít dân hơn.',
    tips: 'GDP/người = GDP ÷ DS. GDP lớn ≠ GDP/người cao!',
    mnemonics: 'Indonesia = Tổng GDP số 1; Malaysia = GDP/người số 1',
    statements: [
      { id: 'tf_p2_4_a', text: 'a) In-đô-nê-xi-a có quy mô GDP lớn nhất trong số các quốc gia trong bảng.', isTrue: true },
      { id: 'tf_p2_4_b', text: 'b) Ma-lai-xi-a có GDP/người cao nhất mặc dù có quy mô dân số nhỏ nhất.', isTrue: true },
      { id: 'tf_p2_4_c', text: 'c) Việt Nam có GDP/người thấp hơn Phi-líp-pin vì GDP tổng thấp hơn một chút.', isTrue: false },
      { id: 'tf_p2_4_d', text: 'd) Thái Lan có GDP tổng đứng thứ hai nhưng GDP/người thấp hơn Ma-lai-xi-a.', isTrue: true }
    ]
  },
  {
    id: 'tf_p2_5',
    type: 'true_false',
    text: 'Cho bảng số liệu về xuất nhập khẩu hàng hóa của Việt Nam. Hãy xem xét các nhận định sau:',
    context: '**XUẤT NHẬP KHẨU HÀNG HÓA VIỆT NAM (tỉ USD)**\n| Năm | Xuất khẩu | Nhập khẩu | Cán cân TM |\n|---|---|---|---|\n| 2015 | 162,4 | 165,6 | -3,2 |\n| 2018 | 243,5 | 236,7 | +6,8 |\n| 2020 | 282,7 | 262,4 | +20,3 |\n| 2022 | 371,9 | 360,7 | +11,2 |\n| 2023 | 355,5 | 327,5 | +28,0 |',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Dịch vụ: Thương mại và du lịch',
    cognitiveLevel: 'Vận dụng',
    explanation: 'VN nhập siêu 2015, xuất siêu từ 2018. XK và NK đều tăng mạnh. 2023 XK giảm nhẹ so với 2022 nhưng cán cân thương mại vẫn dương (+28 tỉ USD) vì NK giảm nhiều hơn.',
    tips: 'Cán cân TM > 0 = xuất siêu. Cán cân < 0 = nhập siêu.',
    mnemonics: 'Dương = Dư = Xuất siêu; Âm = Âm u = Nhập siêu',
    statements: [
      { id: 'tf_p2_5_a', text: 'a) Giai đoạn 2015–2023, kim ngạch xuất khẩu của Việt Nam có xu hướng tăng.', isTrue: true },
      { id: 'tf_p2_5_b', text: 'b) Năm 2015, Việt Nam ở tình trạng nhập siêu.', isTrue: true },
      { id: 'tf_p2_5_c', text: 'c) Từ năm 2018 đến 2023, Việt Nam liên tục xuất siêu.', isTrue: true },
      { id: 'tf_p2_5_d', text: 'd) Kim ngạch xuất khẩu năm 2023 tăng so với năm 2022.', isTrue: false }
    ]
  },
  {
    id: 'tf_p2_6',
    type: 'true_false',
    text: 'Cho bảng số liệu về sản lượng thủy sản Việt Nam qua các năm. Hãy xem xét các nhận định sau:',
    context: '**SẢN LƯỢNG THỦY SẢN VIỆT NAM (nghìn tấn)**\n| Năm | Khai thác | Nuôi trồng | Tổng số |\n|---|---|---|---|\n| 2000 | 1 280,6 | 589,5 | 1 870,1 |\n| 2010 | 2 414,4 | 2 706,8 | 5 121,2 |\n| 2020 | 3 851,5 | 4 563,9 | 8 415,4 |\n| 2023 | 3 898,5 | 5 223,0 | 9 121,5 |',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Tổng SL thủy sản tăng ~4,9 lần (2000-2023). Từ 2010 nuôi trồng vượt khai thác và tiếp tục tăng — thể hiện phát triển bền vững hơn. Sản lượng khai thác năm 2023 ≈ 3 lần năm 2000 (3898/1281 ≈ 3,04 lần).',
    tips: 'Năm 2000: khai thác > nuôi trồng. Từ 2010: nuôi trồng > khai thác',
    mnemonics: 'KT < NT từ 2010 → Nuôi trồng chiếm ưu thế',
    statements: [
      { id: 'tf_p2_6_a', text: 'a) Tổng sản lượng thủy sản Việt Nam tăng liên tục trong giai đoạn 2000–2023.', isTrue: true },
      { id: 'tf_p2_6_b', text: 'b) Năm 2000, sản lượng khai thác thủy sản lớn hơn sản lượng nuôi trồng.', isTrue: true },
      { id: 'tf_p2_6_c', text: 'c) Từ năm 2010, sản lượng nuôi trồng thủy sản đã vượt sản lượng khai thác.', isTrue: true },
      { id: 'tf_p2_6_d', text: 'd) Sản lượng khai thác thủy sản năm 2023 gấp hơn 3 lần so với năm 2000.', isTrue: true }
    ]
  },
  {
    id: 'tf_p2_7',
    type: 'true_false',
    text: 'Cho bảng số liệu về lượng khách du lịch và doanh thu du lịch của Việt Nam. Hãy xem xét các nhận định sau:',
    context: '**DU LỊCH VIỆT NAM**\n| Năm | Khách QT (triệu lượt) | Khách NĐ (triệu lượt) | Doanh thu (nghìn tỉ đồng) |\n|---|---|---|---|\n| 2015 | 7,9 | 57,0 | 337,9 |\n| 2019 | 18,0 | 85,6 | 755,0 |\n| 2020 | 3,8 | 56,2 | 312,2 |\n| 2022 | 3,5 | 101,3 | 495,0 |\n| 2023 | 12,6 | 108,0 | 678,0 |',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Dịch vụ: Thương mại và du lịch',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Du lịch 2020-2021 bị COVID-19 ảnh hưởng nặng. Khách QT giảm mạnh (18→3,8 triệu); khách NĐ duy trì. 2022: khách NĐ vượt đỉnh 2019. 2023: khách QT phục hồi (12,6 triệu) nhưng chưa đạt đỉnh 2019 (18 triệu).',
    tips: 'COVID: Quốc tế ↓↓ mạnh hơn nội địa. Nội địa hồi phục nhanh hơn.',
    mnemonics: '2019 = Đỉnh QT; 2022 = Đỉnh NĐ; 2023 = Đang hồi phục',
    statements: [
      { id: 'tf_p2_7_a', text: 'a) Năm 2019, lượng khách du lịch quốc tế đạt mức cao nhất trong bảng số liệu.', isTrue: true },
      { id: 'tf_p2_7_b', text: 'b) Giai đoạn 2020–2022, cả khách quốc tế và khách nội địa đều giảm so với năm 2019.', isTrue: false },
      { id: 'tf_p2_7_c', text: 'c) Năm 2023, ngành du lịch đã phục hồi nhưng lượng khách quốc tế chưa đạt đỉnh năm 2019.', isTrue: true },
      { id: 'tf_p2_7_d', text: 'd) Doanh thu du lịch năm 2023 cao hơn năm 2022.', isTrue: true }
    ]
  },
  {
    id: 'tf_p2_8',
    type: 'true_false',
    text: 'Cho bảng số liệu về sản lượng điện của Việt Nam theo nguồn. Hãy xem xét các nhận định sau:',
    context: '**SẢN LƯỢNG ĐIỆN THEO NGUỒN (tỉ kWh)**\n| Nguồn điện | 2015 | 2020 | 2023 |\n|---|---|---|---|\n| Thủy điện | 65,2 | 72,6 | 98,3 |\n| Nhiệt điện than | 51,3 | 116,2 | 131,8 |\n| Khí & dầu | 37,4 | 30,3 | 19,4 |\n| Năng lượng tái tạo | 0,1 | 25,0 | 89,4 |\n| **Tổng** | **161,1** | **247,1** | **340,5** |',
    topic: 'Địa lí các ngành kinh tế',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Tổng sản lượng điện tăng >2 lần (161→340 tỉ kWh). NLTT tăng đột biến (0,1→89,4 = tăng ~894 lần). Nhiệt điện than vẫn chiếm tỉ trọng lớn nhất 2020-2023. Điện khí & dầu giảm liên tục.',
    tips: 'NLTT tăng tốc độ nhanh nhất NHƯNG nhiệt điện than vẫn có SẢN LƯỢNG cao nhất 2023',
    mnemonics: 'Than: nhiều nhất; NLTT: tăng nhanh nhất; Khí-dầu: giảm nhất',
    statements: [
      { id: 'tf_p2_8_a', text: 'a) Tổng sản lượng điện Việt Nam tăng hơn 2 lần trong giai đoạn 2015–2023.', isTrue: true },
      { id: 'tf_p2_8_b', text: 'b) Năng lượng tái tạo là nguồn có tốc độ tăng trưởng nhanh nhất giai đoạn 2015–2023.', isTrue: true },
      { id: 'tf_p2_8_c', text: 'c) Nhiệt điện than luôn là nguồn cung cấp điện chủ yếu trong tất cả các năm của bảng.', isTrue: false },
      { id: 'tf_p2_8_d', text: 'd) Sản lượng điện từ khí và dầu có xu hướng giảm trong giai đoạn 2015–2023.', isTrue: true }
    ]
  },
  {
    id: 'tf_p2_9',
    type: 'true_false',
    text: 'Cho bảng số liệu về cơ cấu lao động theo ngành kinh tế của Việt Nam. Hãy xem xét các nhận định sau:',
    context: '**CƠ CẤU LAO ĐỘNG THEO NGÀNH KINH TẾ VIỆT NAM (%)**\n| Ngành | 2010 | 2015 | 2020 | 2023 |\n|---|---|---|---|---|\n| Nông-lâm-thủy sản | 48,7 | 44,0 | 33,1 | 28,1 |\n| Công nghiệp-Xây dựng | 21,7 | 23,6 | 30,3 | 33,1 |\n| Dịch vụ | 29,6 | 32,4 | 36,6 | 38,8 |',
    topic: 'Địa lí dân cư',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Cơ cấu LĐ chuyển dịch đúng hướng CNH-HĐH: NN giảm mạnh (48,7→28,1%), CN+DV tăng. Năm 2023 DV thu hút nhiều LĐ nhất (38,8%). NN vẫn còn ~28% = vẫn đông nhưng không còn chiếm đa số.',
    tips: 'Năm 2023: DV(38,8%) > CN(33,1%) > NN(28,1%) — DV thu hút nhiều LĐ nhất',
    mnemonics: 'CNH-HĐH: NN↓ CN↑ DV↑ — giống chuyển dịch cơ cấu GDP',
    statements: [
      { id: 'tf_p2_9_a', text: 'a) Tỉ lệ lao động trong ngành nông-lâm-thủy sản giảm liên tục trong giai đoạn 2010–2023.', isTrue: true },
      { id: 'tf_p2_9_b', text: 'b) Năm 2023, ngành dịch vụ thu hút nhiều lao động nhất trong 3 nhóm ngành.', isTrue: true },
      { id: 'tf_p2_9_c', text: 'c) Sự chuyển dịch cơ cấu lao động phản ánh quá trình công nghiệp hóa, hiện đại hóa đất nước.', isTrue: true },
      { id: 'tf_p2_9_d', text: 'd) Đến năm 2023, nông nghiệp đã không còn là ngành thu hút nhiều lao động nhất.', isTrue: true }
    ]
  },
  {
    id: 'tf_p2_10',
    type: 'true_false',
    text: 'Cho bảng số liệu về cơ cấu vốn đầu tư phát triển toàn xã hội của Việt Nam. Hãy xem xét các nhận định sau:',
    context: '**VỐN ĐẦU TƯ PHÁT TRIỂN TOÀN XÃ HỘI VIỆT NAM**\n| Thành phần | 2015 (%) | 2020 (%) | 2023 (%) |\n|---|---|---|---|\n| Nhà nước | 38,6 | 34,3 | 32,1 |\n| Ngoài Nhà nước | 38,7 | 43,9 | 55,6 |\n| FDI | 22,7 | 21,8 | 12,3 |\n| **Tổng (nghìn tỉ đồng)** | **1 367** | **2 164** | **3 422** |',
    topic: 'Địa lí kinh tế - xã hội',
    lesson: 'Chuyển dịch cơ cấu kinh tế',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Tổng vốn ĐT tăng từ 1 367 lên 3 422 nghìn tỉ đồng. Ngoài NN tăng tỉ trọng mạnh nhất, vượt 50% năm 2023. FDI giảm tỉ trọng tương đối (nhưng giá trị tuyệt đối vẫn tăng vì tổng vốn tăng nhiều).',
    tips: 'Tỉ trọng FDI giảm ≠ FDI giảm về giá trị tuyệt đối!',
    mnemonics: 'Ngoài NN vượt 50% = Kinh tế thị trường phát triển mạnh',
    statements: [
      { id: 'tf_p2_10_a', text: 'a) Tổng vốn đầu tư phát triển toàn xã hội tăng liên tục trong giai đoạn 2015–2023.', isTrue: true },
      { id: 'tf_p2_10_b', text: 'b) Khu vực kinh tế ngoài Nhà nước có tỉ trọng vốn đầu tư ngày càng tăng và vượt 50% vào năm 2023.', isTrue: true },
      { id: 'tf_p2_10_c', text: 'c) Tỉ trọng vốn FDI giảm có nghĩa là giá trị đầu tư FDI vào Việt Nam đã giảm.', isTrue: false },
      { id: 'tf_p2_10_d', text: 'd) Sự thay đổi cơ cấu vốn đầu tư phản ánh sự phát triển của nền kinh tế thị trường tại Việt Nam.', isTrue: true }
    ]
  },

  // ===== PHẦN II - LUYỆN TẬP ĐÚNG/SAI: DẠNG BIỂU ĐỒ (chuẩn cấu trúc BGD 2025) =====
  // Câu hỏi phân tích biểu đồ: nhận dạng loại biểu đồ + đọc số liệu + rút ra nhận xét

  {
    id: 'bieu_do_1',
    type: 'true_false',
    text: 'Cho biểu đồ thể hiện sản lượng lúa phân theo vùng của Việt Nam năm 2023. Hãy xem xét các nhận định sau:',
    context: '**BIỂU ĐỒ TRÒN – Cơ cấu sản lượng lúa phân theo vùng năm 2023 (%)**\n*(Số liệu để vẽ biểu đồ – thí sinh đọc và phân tích)*\n\n| Vùng | Tỉ trọng (%) |\n|---|---|\n| Đồng bằng sông Cửu Long | 54,5 |\n| Đồng bằng sông Hồng | 15,0 |\n| Bắc Trung Bộ | 8,2 |\n| Duyên hải Nam Trung Bộ | 6,1 |\n| Trung du và MN phía Bắc | 8,7 |\n| Tây Nguyên | 3,2 |\n| Đông Nam Bộ | 4,3 |\n\n> **Gợi ý:** Tổng = 100%. Vẽ biểu đồ tròn thể hiện cơ cấu (tỉ lệ %).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Vận dụng',
    explanation: 'ĐBSCL chiếm 54,5% — trên 50% → đây là vùng sản xuất lúa lớn nhất cả nước (hơn 50%). Biểu đồ thích hợp để thể hiện CƠ CẤU (%) là biểu đồ TRÒN hoặc miền. ĐBSH đứng thứ 2 (15%). Tây Nguyên có tỉ trọng thấp nhất (3,2%). Không thể dùng biểu đồ đường để thể hiện cơ cấu tại MỘT thời điểm.',
    tips: 'Cơ cấu tại một thời điểm → biểu đồ TRÒN. Cơ cấu nhiều thời điểm → biểu đồ MIỀN.',
    mnemonics: 'Một thời điểm = Tròn; Nhiều thời điểm = Miền; Số lượng qua nhiều năm = Cột hoặc Đường',
    statements: [
      { id: 'bieu_do_1_a', text: 'a) Đồng bằng sông Cửu Long chiếm trên 50% sản lượng lúa cả nước năm 2023.', isTrue: true },
      { id: 'bieu_do_1_b', text: 'b) Biểu đồ tròn là dạng biểu đồ thích hợp nhất để thể hiện cơ cấu sản lượng lúa phân theo vùng năm 2023.', isTrue: true },
      { id: 'bieu_do_1_c', text: 'c) Đồng bằng sông Hồng đứng vị trí thứ hai về tỉ trọng sản lượng lúa.', isTrue: true },
      { id: 'bieu_do_1_d', text: 'd) Biểu đồ đường là dạng biểu đồ phù hợp nhất để thể hiện số liệu cơ cấu trên.', isTrue: false }
    ]
  },

  {
    id: 'bieu_do_2',
    type: 'true_false',
    text: 'Cho biểu đồ thể hiện sự thay đổi dân số và tỉ lệ gia tăng dân số tự nhiên của Việt Nam giai đoạn 2000–2023. Hãy xem xét các nhận định sau:',
    context: '**BIỂU ĐỒ KẾT HỢP – Dân số và Tỉ lệ TGTN Việt Nam**\n*(Cột: Dân số (triệu người) — Đường: Tỉ lệ TGTN (‰))*\n\n| Năm | Dân số (triệu người) | Tỉ lệ TGTN (‰) |\n|---|---|---|\n| 2000 | 77,6 | 14,3 |\n| 2005 | 82,4 | 12,5 |\n| 2010 | 86,9 | 10,1 |\n| 2015 | 91,7 | 9,8 |\n| 2020 | 97,3 | 9,4 |\n| 2023 | 100,3 | 8,9 |\n\n> **Gợi ý:** Biểu đồ kết hợp = cột (dân số) + đường (tỉ lệ TGTN).',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Biểu đồ kết hợp (cột + đường) phù hợp khi có 2 đại lượng khác đơn vị (triệu người và ‰). Dân số tăng liên tục; TGTN giảm liên tục nhưng vẫn dương. Năm 2023 DS = 100,3 ≈ hơn 100 triệu người. Dân số tăng VÀ tỉ lệ TGTN giảm = xu hướng song song, KHÔNG mâu thuẫn.',
    tips: 'Khi số liệu có 2 đại lượng khác đơn vị → BIỂU ĐỒ KẾT HỢP (cột+đường)',
    mnemonics: '2 đại lượng ≠ đơn vị → Kết hợp; 1 đại lượng qua nhiều năm → Đường hoặc Cột đơn',
    statements: [
      { id: 'bieu_do_2_a', text: 'a) Biểu đồ kết hợp (cột và đường) là dạng phù hợp nhất để thể hiện số liệu trên.', isTrue: true },
      { id: 'bieu_do_2_b', text: 'b) Trong giai đoạn 2000–2023, dân số Việt Nam tăng liên tục trong khi tỉ lệ gia tăng tự nhiên giảm liên tục.', isTrue: true },
      { id: 'bieu_do_2_c', text: 'c) Năm 2023, dân số Việt Nam đã vượt mốc 100 triệu người.', isTrue: true },
      { id: 'bieu_do_2_d', text: 'd) Tỉ lệ gia tăng tự nhiên giảm chứng tỏ dân số Việt Nam đang giảm.', isTrue: false }
    ]
  },

  {
    id: 'bieu_do_3',
    type: 'true_false',
    text: 'Cho biểu đồ thể hiện cơ cấu sử dụng đất của Việt Nam năm 2023. Hãy xem xét các nhận định sau:',
    context: '**BIỂU ĐỒ TRÒN – Cơ cấu sử dụng đất Việt Nam năm 2023 (%)**\n\n| Loại đất | Diện tích (triệu ha) | Tỉ trọng (%) |\n|---|---|---|\n| Đất nông nghiệp | 27,9 | 84,3 |\n| Đất phi nông nghiệp | 4,8 | 14,5 |\n| Đất chưa sử dụng | 0,4 | 1,2 |\n| **Tổng diện tích tự nhiên** | **33,1** | **100** |\n\n> **Gợi ý:** Đất nông nghiệp = đất SX nông nghiệp + đất lâm nghiệp + đất nuôi trồng thủy sản.',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Sự phân hoá đa dạng của thiên nhiên',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Đất nông nghiệp chiếm tỉ trọng lớn nhất (84,3%), bao gồm cả đất lâm nghiệp. Đất chưa sử dụng rất thấp (1,2%) phản ánh khai thác đất khá triệt để. Biểu đồ tròn phù hợp thể hiện cơ cấu tại một thời điểm. Diện tích tự nhiên ~33,1 triệu ha → mật độ dân số cao.',
    tips: 'Đất nông nghiệp > 80% = tiết kiệm đất, đất chưa SX còn ít → áp lực đất đai lớn',
    mnemonics: 'Tỉ trọng lớn nhất: Nông nghiệp > Phi NN > Chưa SX',
    statements: [
      { id: 'bieu_do_3_a', text: 'a) Đất nông nghiệp chiếm tỉ trọng lớn nhất trong cơ cấu sử dụng đất của Việt Nam năm 2023.', isTrue: true },
      { id: 'bieu_do_3_b', text: 'b) Đất chưa sử dụng chiếm tỉ trọng nhỏ nhất, phản ánh quỹ đất tự nhiên đang được khai thác triệt để.', isTrue: true },
      { id: 'bieu_do_3_c', text: 'c) Biểu đồ miền là dạng phù hợp nhất để thể hiện cơ cấu sử dụng đất tại năm 2023.', isTrue: false },
      { id: 'bieu_do_3_d', text: 'd) Diện tích tự nhiên của Việt Nam theo bảng trên là hơn 33 triệu ha.', isTrue: true }
    ]
  },

  {
    id: 'bieu_do_4',
    type: 'true_false',
    text: 'Cho biểu đồ thể hiện sự thay đổi cơ cấu lao động theo khu vực kinh tế của Việt Nam giai đoạn 2010–2023. Hãy xem xét các nhận định sau:',
    context: '**BIỂU ĐỒ MIỀN – Cơ cấu lao động theo ngành kinh tế Việt Nam (%)**\n*(Thích hợp thể hiện cơ cấu qua nhiều năm)*\n\n| Năm | Nông-lâm-TS (%) | Công nghiệp-XD (%) | Dịch vụ (%) |\n|---|---|---|---|\n| 2010 | 48,7 | 21,7 | 29,6 |\n| 2015 | 44,0 | 23,6 | 32,4 |\n| 2020 | 33,1 | 30,3 | 36,6 |\n| 2023 | 28,1 | 33,1 | 38,8 |\n\n> **Gợi ý:** Tổng mỗi năm = 100%. Biểu đồ miền có 3 phần chồng nhau.',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dân số, lao động và việc làm',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Biểu đồ miền phù hợp khi thể hiện cơ cấu QUA NHIỀU NĂM (≥3 năm, ≥2 thành phần). Năm 2023: DV(38,8%)>CN(33,1%)>NN(28,1%). NN giảm mạnh từ 48,7% → 28,1%. Tổng mỗi cột = 100%. DV luôn cao hơn CN trong bảng.',
    tips: 'Cơ cấu nhiều năm → BIỂU ĐỒ MIỀN (không phải tròn). Từ 3 cột: mỗi cột tổng = 100%',
    mnemonics: 'MIỀN = nhiều Thời điểm; TRÒN = một Thời điểm',
    statements: [
      { id: 'bieu_do_4_a', text: 'a) Biểu đồ miền là dạng phù hợp nhất để thể hiện sự thay đổi cơ cấu lao động qua các năm.', isTrue: true },
      { id: 'bieu_do_4_b', text: 'b) Năm 2023, ngành dịch vụ thu hút tỉ lệ lao động cao nhất trong 3 nhóm ngành.', isTrue: true },
      { id: 'bieu_do_4_c', text: 'c) Tỉ trọng lao động ngành nông-lâm-thủy sản tăng liên tục trong giai đoạn 2010–2023.', isTrue: false },
      { id: 'bieu_do_4_d', text: 'd) Tổng tỉ trọng của 3 nhóm ngành trong mỗi năm luôn bằng 100%.', isTrue: true }
    ]
  },

  {
    id: 'bieu_do_5',
    type: 'true_false',
    text: 'Cho biểu đồ thể hiện sản lượng khai thác và nuôi trồng thủy sản của Việt Nam giai đoạn 2000–2023. Hãy xem xét các nhận định sau:',
    context: '**BIỂU ĐỒ CỘT GHÉP – Sản lượng thủy sản Việt Nam (nghìn tấn)**\n*(Cột ghép: so sánh 2 giá trị cùng năm)*\n\n| Năm | Khai thác | Nuôi trồng |\n|---|---|---|\n| 2000 | 1 280,6 | 589,5 |\n| 2010 | 2 414,4 | 2 706,8 |\n| 2020 | 3 851,5 | 4 563,9 |\n| 2023 | 3 898,5 | 5 223,0 |\n\n> **Gợi ý:** Biểu đồ cột ghép thể hiện 2 đại lượng cùng đơn vị qua nhiều năm để so sánh.',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Biểu đồ cột ghép phù hợp khi so sánh 2 đại lượng CÙNG đơn vị qua nhiều năm. Năm 2000 khai thác > nuôi trồng; từ 2010 nuôi trồng > khai thác. Tốc độ tăng nuôi trồng nhanh hơn khai thác. Năm 2023: nuôi trồng (5223) > khai thác (3898,5). Biểu đồ đường cũng có thể dùng nhưng cột ghép là TỐT NHẤT để so sánh.',
    tips: '2 đại lượng CÙNG đơn vị → Cột ghép HOẶC đường. KHÁC đơn vị → Kết hợp',
    mnemonics: 'Cùng đơn vị + so sánh → Cột ghép; Cùng đơn vị + thể hiện xu hướng → Đường',
    statements: [
      { id: 'bieu_do_5_a', text: 'a) Biểu đồ cột ghép là dạng phù hợp để so sánh sản lượng khai thác và nuôi trồng thủy sản qua các năm.', isTrue: true },
      { id: 'bieu_do_5_b', text: 'b) Năm 2000, sản lượng khai thác thủy sản lớn hơn sản lượng nuôi trồng.', isTrue: true },
      { id: 'bieu_do_5_c', text: 'c) Từ năm 2010, sản lượng nuôi trồng đã vượt sản lượng khai thác và tiếp tục tăng.', isTrue: true },
      { id: 'bieu_do_5_d', text: 'd) Biểu đồ miền là dạng duy nhất có thể dùng để thể hiện số liệu trên.', isTrue: false }
    ]
  },

  {
    id: 'bieu_do_6',
    type: 'true_false',
    text: 'Cho biểu đồ thể hiện nhiệt độ trung bình và lượng mưa trung bình tháng tại Hà Nội. Hãy xem xét các nhận định sau:',
    context: '**BIỂU ĐỒ KHÍ HẬU – Nhiệt độ (°C) và Lượng mưa (mm) tháng tại Hà Nội**\n*(Cột: Lượng mưa — Đường: Nhiệt độ)*\n\n| Tháng | 1 | 4 | 7 | 10 |\n|---|---|---|---|---|\n| Nhiệt độ (°C) | 16,4 | 23,7 | 28,9 | 24,1 |\n| Lượng mưa (mm) | 18,6 | 81,0 | 288,2 | 130,7 |\n\n> **Gợi ý:** Biểu đồ khí hậu = cột (lượng mưa) + đường (nhiệt độ). Đây là dạng kết hợp đặc biệt.',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Thiên nhiên nhiệt đới ẩm gió mùa',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Biểu đồ khí hậu là biểu đồ KẾT HỢP đặc biệt: cột = lượng mưa (mm), đường = nhiệt độ (°C). Tháng 7 nóng nhất (28,9°C) và mưa nhiều nhất (288,2mm) → mùa hạ. Tháng 1 lạnh nhất (16,4°C) và ít mưa nhất (18,6mm) → mùa đông. Biên độ nhiệt: tháng 7 - tháng 1 = 28,9 - 16,4 = 12,5°C.',
    tips: 'Biểu đồ khí hậu LUÔN là: cột (mưa) + đường (nhiệt độ). Đây là DẠNG RIÊNG của biểu đồ kết hợp.',
    mnemonics: 'Mưa = Cột (cao thấp như mưa rơi); Nhiệt độ = Đường (lên xuống như thủy ngân)',
    statements: [
      { id: 'bieu_do_6_a', text: 'a) Biểu đồ khí hậu tại Hà Nội là dạng biểu đồ kết hợp giữa cột (lượng mưa) và đường (nhiệt độ).', isTrue: true },
      { id: 'bieu_do_6_b', text: 'b) Tháng 7 là tháng nóng nhất và có lượng mưa lớn nhất trong bảng số liệu.', isTrue: true },
      { id: 'bieu_do_6_c', text: 'c) Biên độ nhiệt giữa tháng nóng nhất và lạnh nhất trong bảng là 12,5°C.', isTrue: true },
      { id: 'bieu_do_6_d', text: 'd) Tháng 4 có lượng mưa lớn hơn tháng 10.', isTrue: false }
    ]
  },

  {
    id: 'bieu_do_7',
    type: 'true_false',
    text: 'Cho biểu đồ thể hiện cơ cấu xuất khẩu hàng hóa của Việt Nam năm 2023 phân theo nhóm hàng. Hãy xem xét các nhận định sau:',
    context: '**BIỂU ĐỒ TRÒN – Cơ cấu xuất khẩu hàng hóa Việt Nam 2023 (%)**\n\n| Nhóm hàng | Tỉ trọng (%) |\n|---|---|\n| Điện tử, máy tính và linh kiện | 32,4 |\n| Điện thoại và linh kiện | 15,7 |\n| Máy móc, thiết bị, dụng cụ | 10,1 |\n| Hàng dệt may | 10,6 |\n| Giày dép | 7,2 |\n| Nông-lâm-thủy sản | 10,3 |\n| Các mặt hàng khác | 13,7 |\n\n> **Gợi ý:** Tổng = 100%. Nhóm điện tử chiếm tỉ trọng lớn nhất.',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Dịch vụ: Thương mại và du lịch',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Cơ cấu XK thay đổi rõ rệt: điện tử-máy tính chiếm tỉ trọng lớn nhất (32,4%) → VN là nước XK điện tử lớn. Nông-lâm-thủy sản chỉ còn 10,3% → cơ cấu XK không còn phụ thuộc nông nghiệp. Hàng công nghiệp (điện tử + điện thoại + máy móc + dệt may + giày) chiếm ~76%.',
    tips: 'Cơ cấu XK VN: Điện tử đứng đầu → phản ánh FDI công nghệ cao (Samsung, Intel...)',
    mnemonics: 'Điện tử 32% = Lớn nhất; Nông sản chỉ còn 10% = XK đã CNH-HĐH',
    statements: [
      { id: 'bieu_do_7_a', text: 'a) Nhóm hàng điện tử, máy tính và linh kiện chiếm tỉ trọng lớn nhất trong cơ cấu xuất khẩu năm 2023.', isTrue: true },
      { id: 'bieu_do_7_b', text: 'b) Hàng nông-lâm-thủy sản chiếm tỉ trọng lớn nhất trong cơ cấu xuất khẩu của Việt Nam.', isTrue: false },
      { id: 'bieu_do_7_c', text: 'c) Sự thay đổi cơ cấu xuất khẩu phản ánh quá trình công nghiệp hóa, phát triển công nghiệp chế biến, chế tạo.', isTrue: true },
      { id: 'bieu_do_7_d', text: 'd) Cơ cấu xuất khẩu năm 2023 cho thấy kinh tế Việt Nam vẫn phụ thuộc chủ yếu vào nông nghiệp.', isTrue: false }
    ]
  },

  {
    id: 'bieu_do_8',
    type: 'true_false',
    text: 'Cho biểu đồ thể hiện tốc độ tăng trưởng GDP của Việt Nam và một số nước Đông Nam Á giai đoạn 2019–2023. Hãy xem xét các nhận định sau:',
    context: '**BIỂU ĐỒ ĐƯỜNG – Tốc độ tăng trưởng GDP (%/năm)**\n*(So sánh Việt Nam với các nước ĐNÁ)*\n\n| Năm | Việt Nam | In-đô-nê-xi-a | Thái Lan | Phi-líp-pin |\n|---|---|---|---|---|\n| 2019 | 7,0 | 5,0 | 2,4 | 6,0 |\n| 2020 | 2,9 | -2,1 | -6,2 | -9,5 |\n| 2021 | 2,6 | 3,7 | 1,5 | 5,7 |\n| 2022 | 8,0 | 5,3 | 2,6 | 7,6 |\n| 2023 | 5,0 | 5,1 | 1,9 | 5,5 |\n\n> **Gợi ý:** Biểu đồ đường thể hiện sự thay đổi theo thời gian của nhiều chỉ tiêu cùng đơn vị (%).',
    topic: 'Địa lí Đông Nam Á (Lớp 11)',
    lesson: 'Khu vực Đông Nam Á',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Biểu đồ đường phù hợp khi: so sánh nhiều đường cùng đơn vị (%). Năm 2020 tất cả đều giảm do COVID-19. VN tăng trưởng dương cả 2020 và 2021 (2,9% và 2,6%) trong khi các nước khác âm hoặc rất thấp. Năm 2022 VN tăng cao nhất (8,0%) — phục hồi hậu COVID mạnh nhất.',
    tips: 'Nhiều chỉ tiêu cùng đơn vị qua nhiều năm → ĐƯỜNG (dễ so sánh xu hướng)',
    mnemonics: '2020 = COVID tất cả xuống; VN vẫn dương = Kinh tế bền vững',
    statements: [
      { id: 'bieu_do_8_a', text: 'a) Biểu đồ đường là dạng phù hợp nhất để thể hiện và so sánh tốc độ tăng trưởng GDP của nhiều quốc gia qua các năm.', isTrue: true },
      { id: 'bieu_do_8_b', text: 'b) Năm 2020, tất cả các quốc gia trong bảng đều có tốc độ tăng trưởng GDP giảm so với năm 2019 do tác động của đại dịch COVID-19.', isTrue: true },
      { id: 'bieu_do_8_c', text: 'c) Việt Nam có tốc độ tăng trưởng GDP âm trong năm 2020 và 2021.', isTrue: false },
      { id: 'bieu_do_8_d', text: 'd) Năm 2022, Việt Nam có tốc độ tăng trưởng GDP cao nhất trong số 4 quốc gia được thể hiện.', isTrue: true }
    ]
  },

  {
    id: 'bieu_do_9',
    type: 'true_false',
    text: 'Cho biểu đồ hình tròn thể hiện cơ cấu diện tích gieo trồng phân theo nhóm cây của Việt Nam năm 2023. Hãy xem xét các nhận định sau:',
    context: '**BIỂU ĐỒ TRÒN – Cơ cấu diện tích gieo trồng phân theo nhóm cây năm 2023 (%)**\n\n| Nhóm cây | Tỉ trọng (%) |\n|---|---|\n| Cây lương thực (lúa + hoa màu) | 57,2 |\n| Cây công nghiệp | 14,1 |\n| Cây ăn quả | 12,8 |\n| Cây rau-đậu | 11,5 |\n| Cây khác | 4,4 |\n\n> **Gợi ý:** Cây lương thực chiếm tỉ trọng lớn nhất → Lúa vẫn là cây trồng chủ lực.',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển nông nghiệp, lâm nghiệp và thuỷ sản',
    cognitiveLevel: 'Thông hiểu',
    explanation: 'Cây lương thực chiếm 57,2% (hơn 1/2 diện tích gieo trồng) → VN vẫn là nước nông nghiệp lúa nước. Cây công nghiệp 14,1% (cà phê, cao su, điều...) đứng thứ 2. Cây ăn quả tăng do nhu cầu xuất khẩu. Tổng = 100%.',
    tips: 'Cây lương thực > 50% = đặc trưng nước đang phát triển với lúa là chủ lực',
    mnemonics: 'Lương thực 57% → Việt Nam vẫn là nước nông nghiệp lúa nước',
    statements: [
      { id: 'bieu_do_9_a', text: 'a) Cây lương thực chiếm tỉ trọng lớn nhất trong cơ cấu diện tích gieo trồng năm 2023.', isTrue: true },
      { id: 'bieu_do_9_b', text: 'b) Cây công nghiệp đứng vị trí thứ hai về tỉ trọng diện tích gieo trồng.', isTrue: true },
      { id: 'bieu_do_9_c', text: 'c) Tổng diện tích gieo trồng của cây ăn quả và cây rau-đậu lớn hơn cây công nghiệp.', isTrue: true },
      { id: 'bieu_do_9_d', text: 'd) Biểu đồ đường là dạng phù hợp nhất để thể hiện cơ cấu diện tích gieo trồng tại năm 2023.', isTrue: false }
    ]
  },

  {
    id: 'bieu_do_10',
    type: 'true_false',
    text: 'Cho biểu đồ thể hiện sản lượng điện sản xuất của Việt Nam phân theo nguồn năm 2015 và năm 2023. Hãy xem xét các nhận định sau:',
    context: '**BIỂU ĐỒ CỘT NHÓM – Sản lượng điện phân theo nguồn (tỉ kWh)**\n*(So sánh giữa 2 năm 2015 và 2023)*\n\n| Nguồn điện | 2015 | 2023 | Tăng (lần) |\n|---|---|---|---|\n| Thủy điện | 65,2 | 98,3 | 1,5 |\n| Nhiệt điện than | 51,3 | 131,8 | 2,6 |\n| Điện khí & dầu | 37,4 | 19,4 | giảm |\n| Năng lượng tái tạo | 0,1 | 89,4 | ~894 |\n| **Tổng** | **161,1** | **340,5** | **2,1** |\n\n> **Gợi ý:** Biểu đồ cột nhóm (kép) so sánh 2 thời điểm → thấy rõ thay đổi từng nguồn.',
    topic: 'Thực hành kĩ năng địa lí',
    lesson: 'Vấn đề phát triển công nghiệp',
    cognitiveLevel: 'Vận dụng',
    explanation: 'Biểu đồ cột nhóm/kép phù hợp khi so sánh nhiều chỉ tiêu cùng đơn vị tại 2 thời điểm. Tổng điện tăng 2,1 lần. NLTT tăng đột biến (~894 lần). Nhiệt điện than vẫn là nguồn có SL lớn nhất 2023. Điện khí & dầu là nguồn DUY NHẤT giảm SL. Năm 2023 SL thủy điện < nhiệt điện than < NLTT → Sai! Thủy 98,3 < NLTT 89,4 → Thủy > NLTT. À, Thủy (98,3) > NLTT (89,4).',
    tips: '2 thời điểm, nhiều chỉ tiêu cùng đơn vị → BIỂU ĐỒ CỘT NHÓM (kép)',
    mnemonics: 'Kép = 2 cột sát nhau cho từng chỉ tiêu; Ghép = cột chồng nhau (cộng lại = tổng)',
    statements: [
      { id: 'bieu_do_10_a', text: 'a) Biểu đồ cột nhóm (cột kép) là dạng phù hợp để so sánh sản lượng từng nguồn điện giữa năm 2015 và 2023.', isTrue: true },
      { id: 'bieu_do_10_b', text: 'b) Năng lượng tái tạo là nguồn có tốc độ tăng sản lượng nhanh nhất giai đoạn 2015–2023.', isTrue: true },
      { id: 'bieu_do_10_c', text: 'c) Điện khí và dầu là nguồn điện duy nhất có sản lượng giảm trong giai đoạn 2015–2023.', isTrue: true },
      { id: 'bieu_do_10_d', text: 'd) Năm 2023, sản lượng điện từ năng lượng tái tạo đã vượt sản lượng thủy điện.', isTrue: false }
    ]
  }
];

export const topics = Array.from(new Set(questions.map(q => q.topic)));
export const lessons = Array.from(new Set(questions.map(q => q.lesson).filter(Boolean))) as string[];


